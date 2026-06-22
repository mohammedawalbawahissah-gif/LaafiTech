from django.db import migrations


class Migration(migrations.Migration):

    initial = True
    dependencies = []

    operations = [
        migrations.RunSQL(
            sql="CREATE SCHEMA IF NOT EXISTS laafitech;",
            reverse_sql="DROP SCHEMA IF EXISTS laafitech CASCADE;",
        ),
    ]
