# Generated by Django 4.2.19 on 2025-02-07 17:45

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Doctor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('specialization', models.CharField(max_length=100)),
                ('qualification', models.CharField(max_length=100)),
                ('experience', models.IntegerField()),
                ('consultation_fee', models.DecimalField(decimal_places=2, max_digits=10)),
            ],
        ),
    ]
