import secrets

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

User = get_user_model()

SELF_REGISTERABLE_ROLES = {User.Role.FUNDER, User.Role.ADMIN, User.Role.COMMUNITY_USER, User.Role.AGENT}


def _make_username(email: str, role: str) -> str:
    """
    Auto-generate a unique username from email handle + role suffix.
    e.g. "med@example.com" + "agent" -> "med_agent"
    Appends a short random suffix on collision.
    """
    handle = email.split("@")[0].lower()
    # Strip characters not allowed in Django usernames
    handle = "".join(c for c in handle if c.isalnum() or c in (".", "_", "-", "+"))
    base = f"{handle}_{role}"[:140]  # leave room for suffix
    candidate = base
    for _ in range(10):
        if not User.objects.filter(username=candidate).exists():
            return candidate
        candidate = f"{base}_{secrets.token_hex(3)}"
    return f"{base}_{secrets.token_hex(6)}"


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "username", "first_name", "last_name", "email",
            "phone_number", "role", "region", "district",
            "is_phone_verified", "created_at",
        ]
        read_only_fields = ["id", "username", "created_at", "is_phone_verified"]


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Self-service profile editing (PATCH /api/auth/me/).
    email is intentionally excluded — changing the login identifier is
    an account-recovery operation, not a profile edit.
    role is excluded to prevent self-escalation.
    """

    class Meta:
        model = User
        fields = ["first_name", "last_name", "phone_number", "region", "district"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    invite_code = serializers.CharField(write_only=True, required=False, allow_blank=True)
    catchment_area = serializers.CharField(write_only=True, required=False, allow_blank=True)
    mobile_money_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    momo_provider = serializers.ChoiceField(choices=[], write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "first_name", "last_name", "email",
            "phone_number", "role", "region", "district", "password",
            "invite_code", "catchment_area", "mobile_money_number", "momo_provider",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from agents.models import Agent
        self.fields["momo_provider"].choices = Agent.MomoProvider.choices

    def validate_role(self, value):
        if value not in SELF_REGISTERABLE_ROLES:
            raise serializers.ValidationError("This role can't be self-registered.")
        return value

    def validate(self, attrs):
        role = attrs.get("role")
        email = attrs.get("email", "")

        # Enforce unique email+role at the serializer level for a clear error
        if email and role and User.objects.filter(email=email, role=role).exists():
            raise serializers.ValidationError(
                {"email": f"An account with this email address already exists for the '{role}' role."}
            )

        if role == User.Role.ADMIN:
            configured = getattr(settings, "ADMIN_INVITE_CODE", "")
            provided = attrs.get("invite_code", "")
            if not configured or provided != configured:
                raise serializers.ValidationError(
                    {"invite_code": "A valid invite code is required to register as Admin."}
                )

        if role == User.Role.AGENT:
            errors = {}
            for field in ("mobile_money_number", "momo_provider"):
                if not attrs.get(field):
                    errors[field] = "This field is required to register as Agent."
            if errors:
                raise serializers.ValidationError(errors)

        return attrs

    def _generate_agent_code(self):
        from agents.models import Agent
        for _ in range(20):
            candidate = f"AGT-{secrets.token_hex(3).upper()}"
            if not Agent.objects.filter(agent_code=candidate).exists():
                return candidate
        raise RuntimeError("Could not generate a unique agent_code after 20 attempts.")

    def create(self, validated_data):
        from agents.models import Agent

        validated_data.pop("invite_code", None)
        catchment_area = validated_data.pop("catchment_area", "")
        mobile_money_number = validated_data.pop("mobile_money_number", "")
        momo_provider = validated_data.pop("momo_provider", "")
        password = validated_data.pop("password")

        # Auto-generate username so users never have to type one
        email = validated_data.get("email", "")
        role = validated_data.get("role", "")
        validated_data["username"] = _make_username(email, role)

        with transaction.atomic():
            user = User(**validated_data)
            user.set_password(password)
            user.save()

            if user.role == User.Role.AGENT:
                Agent.objects.create(
                    user=user,
                    agent_code=self._generate_agent_code(),
                    catchment_area=catchment_area,
                    mobile_money_number=mobile_money_number,
                    momo_provider=momo_provider,
                )

            if user.role == User.Role.FUNDER:
                from funders.models import FunderOrganization
                FunderOrganization.objects.create(
                    user=user,
                    name=user.get_full_name() or user.username,
                    funder_type=FunderOrganization.FunderType.INDIVIDUAL_DONOR,
                )

        return user
