from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model shared across all roles on the platform.
    Role determines which app surface (Agent App / Funder Dashboard / Admin
    Console) the user is routed to and which permissions apply.
    """

    class Role(models.TextChoices):
        AGENT = "agent", "Agent"
        FUNDER = "funder", "Funder"
        ADMIN = "admin", "Admin"
        SUPERADMIN = "superadmin", "Superadmin"

    role = models.CharField(max_length=20, choices=Role.choices)
    phone_number = models.CharField(max_length=20, unique=True)
    region = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    is_phone_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "phone_number"
    REQUIRED_FIELDS = ["username", "email"]

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"
