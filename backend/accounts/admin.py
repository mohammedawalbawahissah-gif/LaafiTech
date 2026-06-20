from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ["username", "phone_number", "role", "region", "district", "is_active"]
    list_filter = ["role", "region", "is_active"]
    search_fields = ["username", "phone_number", "email"]
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("LaafiTech profile", {"fields": ("role", "phone_number", "region", "district", "is_phone_verified")}),
    )
