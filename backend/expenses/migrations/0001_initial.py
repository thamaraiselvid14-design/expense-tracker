from decimal import Decimal
import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Expense',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0.01'), message='Amount must be positive and greater than 0.')])),
                ('category', models.CharField(choices=[('Food', 'Food'), ('Shopping', 'Shopping'), ('Travel', 'Travel'), ('Bills', 'Bills'), ('Health', 'Health'), ('Other', 'Other')], max_length=50)),
                ('date', models.DateField()),
                ('payment_method', models.CharField(choices=[('Cash', 'Cash'), ('UPI', 'UPI'), ('Card', 'Card'), ('Bank Transfer', 'Bank Transfer')], max_length=30)),
                ('description', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-date', '-created_at'],
            },
        ),
    ]
