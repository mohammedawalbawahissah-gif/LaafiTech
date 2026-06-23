"""
Migrate from phone-number login to email+role login:
  - Remove unique constraint from phone_number (it's now optional/non-unique)
  - Remove unique constraint from email (same email allowed across roles)
  - Add UniqueConstraint(email, role) — one account per email per role
  - phone_number becomes blank=True (still stored for MoMo payouts)
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0002_initial"),
    ]

    operations = [
        # 1. Drop the unique index on phone_number and make it optional
        migrations.AlterField(
            model_name="user",
            name="phone_number",
            field=models.CharField(max_length=20, blank=True),
        ),
        # 2. Make email non-blank (required) but NOT unique at the column level
        migrations.AlterField(
            model_name="user",
            name="email",
            field=models.EmailField(max_length=254, blank=False),
        ),
        # 3. Add the composite unique constraint: one account per email per role
        migrations.AddConstraint(
            model_name="user",
            constraint=models.UniqueConstraint(
                fields=["email", "role"],
                name="unique_email_per_role",
            ),
        ),
    ]
