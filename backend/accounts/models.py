from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models


class EmailRoleUserManager(UserManager):
    """
    Custom manager so create_superuser and management commands work
    correctly now that USERNAME_FIELD is 'username' but login is by email.
    We keep username as a non-unique auto-generated slug so Django's
    internal machinery (admin, migrations, etc.) stays happy.
    """
    def get_by_natural_key(self, username):
        # Django's auth backend calls this with whatever USERNAME_FIELD
        # returns. We override so email+role lookups in LoginView work
        # directly via User.objects.get(), not this path.
        return self.get(**{self.model.USERNAME_FIELD: username})


class User(AbstractUser):
    """
    Custom user model shared across all roles on the platform.

    Login is by email + role (not phone number). The same email address
    may appear on multiple User rows with different roles — this is
    intentional: an agent can also be a community user, an admin can also
    hold a funder account, etc. Django's USERNAME_FIELD stays as 'username'
    (a non-unique auto-slug) to satisfy AbstractUser's internals; the
    application login layer handles the email+role lookup itself.
    """

    class Role(models.TextChoices):
        AGENT = "agent", "Agent"
        FUNDER = "funder", "Funder"
        ADMIN = "admin", "Admin"
        SUPERADMIN = "superadmin", "Superadmin"
        COMMUNITY_USER = "community_user", "Community User"

    role = models.CharField(max_length=20, choices=Role.choices)
    # email is NOT unique — same address allowed across different roles.
    email = models.EmailField(blank=False)
    phone_number = models.CharField(max_length=20, blank=True)
    region = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    is_phone_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # username is auto-generated (email handle + role suffix) so the user
    # never has to type it. It remains unique per Django's AbstractUser.
    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    objects = EmailRoleUserManager()

    class Meta:
        # Enforce that one person can't hold the same role twice with the
        # same email — but CAN have different roles with the same email.
        constraints = [
            models.UniqueConstraint(
                fields=["email", "role"],
                name="unique_email_per_role",
            )
        ]

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"
