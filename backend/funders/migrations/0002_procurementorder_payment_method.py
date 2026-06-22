from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('funders', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='procurementorder',
            name='payment_method',
            field=models.CharField(
                max_length=20,
                choices=[
                    ('momo_prompt', 'MTN MoMo (USSD prompt)'),
                    ('hubtel_checkout', 'Card / Bank / Other MoMo (Hubtel)'),
                ],
                default='hubtel_checkout',
            ),
        ),
    ]
