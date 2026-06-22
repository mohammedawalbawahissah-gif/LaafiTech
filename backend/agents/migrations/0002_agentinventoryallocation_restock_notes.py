from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("agents", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="agentinventoryallocation",
            name="restock_notes",
            field=models.TextField(
                blank=True,
                help_text="Agent's note accompanying the restock request (e.g. quantity needed, reason).",
            ),
        ),
    ]
