from datetime import date
from django.utils import timezone
from rest_framework import serializers
from .models import Expense

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = [
            'id',
            'title',
            'amount',
            'category',
            'payment_method',
            'date',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'title': {
                'error_messages': {
                    'blank': 'Title cannot be blank or whitespace-only.',
                    'required': 'Title is required.',
                    'max_length': 'Title cannot exceed 100 characters.',
                }
            },
            'amount': {
                'error_messages': {
                    'invalid': 'Amount must be a valid numeric value.',
                    'required': 'Amount is required.',
                    'max_digits': 'Ensure that there are no more than 10 digits in total.',
                    'max_decimal_places': 'Ensure that there are no more than 2 decimal places.',
                }
            },
            'date': {
                'error_messages': {
                    'invalid': 'Date must be a valid date in YYYY-MM-DD format.',
                    'required': 'Date is required.',
                }
            },
            'category': {
                'error_messages': {
                    'invalid_choice': '"{input}" is not a valid category choice. Allowed: Food, Shopping, Travel, Bills, Health, Other.',
                    'required': 'Category is required.',
                }
            },
            'payment_method': {
                'error_messages': {
                    'invalid_choice': '"{input}" is not a valid payment method choice. Allowed: Cash, UPI, Card, Bank Transfer.',
                    'required': 'Payment method is required.',
                }
            },
        }

    def validate_title(self, value):
        """Ensure title is not blank or composed of whitespace only."""
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be blank or whitespace-only.")
        return value.strip()

    def validate_amount(self, value):
        """Ensure amount is positive and strictly greater than 0."""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value

    def validate_date(self, value):
        """Ensure date is not in the future, accounting for client local calendar dates."""
        current_max_date = max(date.today(), timezone.localdate())
        if value > current_max_date:
            raise serializers.ValidationError("Date cannot be in the future.")
        return value
