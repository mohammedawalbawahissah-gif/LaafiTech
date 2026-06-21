import secrets

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

User = get_user_model()

# Roles a stranger can grant themselves via POST /api/auth/register/.
# "agent" is included because RegisterSerializer.create() below builds the
# linked Agent profile atomically -- a role="agent" user is never left
# half-built the way it would be by raw User creation. New agents land in
# Agent.VerificationStatus.PENDING and can't act on the platform until an
# admin verifies them (see distributions/views.py perform_create).
# "superadmin" is excluded outright -- that tier is provisioned manually,
# never via self-registration.
SELF_REGISTERABLE_ROLES = {User.Role.FUNDER, User.Role.ADMIN, User.Role.COMMUNITY_USER, User.Role.AGENT}


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "username", "first_name", "last_name", "email",
            "phone_number", "role", "region", "district",
            "is_phone_verified", "created_at",
        ]
        read_only_fields = ["id", "created_at", "is_phone_verified"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    # Only required/checked when role == "admin"; never stored on the user.
    invite_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    # Only required/used when role == "agent"; never stored on the User
    # model directly -- they go onto the linked Agent profile instead.
    catchment_area = serializers.CharField(write_only=True, required=False, allow_blank=True)
    mobile_money_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    momo_provider = serializers.ChoiceField(
        choices=[], write_only=True, required=False, allow_blank=True
    )

    class Meta:
        model = User
        fields = [
            "username", "first_name", "last_name", "email",
            "phone_number", "role", "region", "district", "password",
            "invite_code", "catchment_area", "mobile_money_number", "momo_provider",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Deferred import avoids a circular import between accounts and
        # agents at module load time.
        from agents.models import Agent

        self.fields["momo_provider"].choices = Agent.MomoProvider.choices

    def validate_role(self, value):
        if value not in SELF_REGISTERABLE_ROLES:
            raise serializers.ValidationError("This role can't be self-registered.")
        return value

    def validate(self, attrs):
        role = attrs.get("role")

        if role == User.Role.ADMIN:
            configured = getattr(settings, "ADMIN_INVITE_CODE", "")
            provided = attrs.get("invite_code", "")
            # Fails closed: if no code is configured server-side, admin
            # self-registration is off entirely, not silently open.
            if not configured or provided != configured:
                raise serializers.ValidationError(
                    {"invite_code": "A valid invite code is required to register as Admin."}
                )

        if role == User.Role.AGENT:
            errors = {}
            for field in ("catchment_area", "mobile_money_number", "momo_provider"):
                if not attrs.get(field):
                    errors[field] = "This field is required to register as Agent."
            if errors:
                raise serializers.ValidationError(errors)

        return attrs

    def _generate_agent_code(self):
        from agents.models import Agent

        # Simple, readable, collision-checked rather than relying on a
        # counter that could race under concurrent signups.
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
                    # verification_status defaults to PENDING on the model --
                    # never set explicitly here, so it can't be overridden
                    # by anything upstream.
                )

        return user
