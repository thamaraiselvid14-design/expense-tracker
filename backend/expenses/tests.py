from datetime import date, timedelta
from decimal import Decimal
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Expense

class ExpenseAPITests(APITestCase):
    def setUp(self):
        self.expense1 = Expense.objects.create(
            title='Healthy Lunch Bowl',
            amount=Decimal('18.50'),
            category='Food',
            payment_method='Card',
            date='2026-09-10',
            description='Salad bar lunch'
        )
        self.expense2 = Expense.objects.create(
            title='Monthly Electricity Bill',
            amount=Decimal('120.00'),
            category='Bills',
            payment_method='Bank Transfer',
            date='2026-09-12',
            description='Power utility'
        )
        self.expense3 = Expense.objects.create(
            title='Weekend Flight Ticket',
            amount=Decimal('250.00'),
            category='Travel',
            payment_method='UPI',
            date='2026-08-20',
            description='Flight trip'
        )

    def test_list_all_expenses(self):
        response = self.client.get('/api/expenses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_retrieve_one_expense(self):
        response = self.client.get(f'/api/expenses/{self.expense1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Healthy Lunch Bowl')
        self.assertEqual(response.data['payment_method'], 'Card')

    def test_retrieve_invalid_id_returns_404_with_message(self):
        response = self.client.get('/api/expenses/99999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Expense with ID '99999' was not found.", response.data['detail'])

    def test_create_expense_success(self):
        payload = {
            'title': 'Office Lunch',
            'amount': '15.75',
            'category': 'Food',
            'payment_method': 'UPI',
            'date': '2026-09-15',
            'description': 'Sandwich combo'
        }
        response = self.client.post('/api/expenses/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Expense.objects.count(), 4)
        self.assertEqual(response.data['title'], 'Office Lunch')

    def test_create_expense_empty_or_whitespace_title_fails(self):
        # Empty string title
        res_empty = self.client.post('/api/expenses/', {
            'title': '',
            'amount': '15.75',
            'category': 'Food',
            'payment_method': 'Cash',
            'date': '2026-09-15'
        })
        self.assertEqual(res_empty.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', res_empty.data)
        self.assertIn("Title cannot be blank or whitespace-only.", res_empty.data['title'])

        # Whitespace-only string title
        res_whitespace = self.client.post('/api/expenses/', {
            'title': '    ',
            'amount': '15.75',
            'category': 'Food',
            'payment_method': 'Cash',
            'date': '2026-09-15'
        })
        self.assertEqual(res_whitespace.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', res_whitespace.data)
        self.assertIn("Title cannot be blank or whitespace-only.", res_whitespace.data['title'])

    def test_create_expense_zero_negative_nonnumeric_amount_fails(self):
        # Zero amount
        res_zero = self.client.post('/api/expenses/', {
            'title': 'Free Snack',
            'amount': '0.00',
            'category': 'Food',
            'payment_method': 'Cash',
            'date': '2026-09-15'
        })
        self.assertEqual(res_zero.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('amount', res_zero.data)

        # Negative amount
        res_neg = self.client.post('/api/expenses/', {
            'title': 'Negative Snack',
            'amount': '-10.50',
            'category': 'Food',
            'payment_method': 'Cash',
            'date': '2026-09-15'
        })
        self.assertEqual(res_neg.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('amount', res_neg.data)

        # Non-numeric amount
        res_nonnum = self.client.post('/api/expenses/', {
            'title': 'Text Amount',
            'amount': 'one-hundred',
            'category': 'Food',
            'payment_method': 'Cash',
            'date': '2026-09-15'
        })
        self.assertEqual(res_nonnum.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('amount', res_nonnum.data)
        self.assertIn("Amount must be a valid numeric value.", res_nonnum.data['amount'])

    def test_create_expense_invalid_format_or_future_date_fails(self):
        # Future date
        future_date = (date.today() + timedelta(days=10)).isoformat()
        res_future = self.client.post('/api/expenses/', {
            'title': 'Future Concert',
            'amount': '50.00',
            'category': 'Other',
            'payment_method': 'Card',
            'date': future_date
        })
        self.assertEqual(res_future.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('date', res_future.data)
        self.assertIn("Date cannot be in the future.", res_future.data['date'])

        # Invalid date format
        res_invalid_format = self.client.post('/api/expenses/', {
            'title': 'Invalid Date',
            'amount': '50.00',
            'category': 'Other',
            'payment_method': 'Card',
            'date': 'not-a-date'
        })
        self.assertEqual(res_invalid_format.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('date', res_invalid_format.data)

    def test_create_expense_invalid_category_or_payment_method_choice_fails(self):
        # Invalid category choice
        res_cat = self.client.post('/api/expenses/', {
            'title': 'Crypto Purchase',
            'amount': '100.00',
            'category': 'Cryptocurrency',
            'payment_method': 'Card',
            'date': '2026-09-15'
        })
        self.assertEqual(res_cat.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('category', res_cat.data)
        self.assertIn("Allowed: Food, Shopping, Travel, Bills, Health, Other.", res_cat.data['category'][0])

        # Invalid payment method choice
        res_pay = self.client.post('/api/expenses/', {
            'title': 'Bitcoin Payment',
            'amount': '100.00',
            'category': 'Food',
            'payment_method': 'Bitcoin',
            'date': '2026-09-15'
        })
        self.assertEqual(res_pay.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('payment_method', res_pay.data)
        self.assertIn("Allowed: Cash, UPI, Card, Bank Transfer.", res_pay.data['payment_method'][0])

    def test_put_update_expense(self):
        payload = {
            'title': 'Updated Electricity Bill',
            'amount': '135.00',
            'category': 'Bills',
            'payment_method': 'Bank Transfer',
            'date': '2026-09-12',
            'description': 'Updated power usage'
        }
        response = self.client.put(f'/api/expenses/{self.expense2.id}/', payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.expense2.refresh_from_db()
        self.assertEqual(self.expense2.title, 'Updated Electricity Bill')
        self.assertEqual(self.expense2.amount, Decimal('135.00'))

    def test_put_update_invalid_data_fails(self):
        # 1. Update with zero/negative amount fails
        res_zero = self.client.put(f'/api/expenses/{self.expense2.id}/', {
            'title': 'Updated Electricity Bill',
            'amount': '0.00',
            'category': 'Bills',
            'payment_method': 'Bank Transfer',
            'date': '2026-09-12',
        })
        self.assertEqual(res_zero.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('amount', res_zero.data)

        # 2. Update with whitespace-only title fails
        res_ws = self.client.put(f'/api/expenses/{self.expense2.id}/', {
            'title': '   ',
            'amount': '50.00',
            'category': 'Bills',
            'payment_method': 'Bank Transfer',
            'date': '2026-09-12',
        })
        self.assertEqual(res_ws.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', res_ws.data)

        # 3. Update with future date fails
        future_date = (date.today() + timedelta(days=5)).isoformat()
        res_future = self.client.put(f'/api/expenses/{self.expense2.id}/', {
            'title': 'Updated Electricity Bill',
            'amount': '50.00',
            'category': 'Bills',
            'payment_method': 'Bank Transfer',
            'date': future_date,
        })
        self.assertEqual(res_future.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('date', res_future.data)

        # 4. Update with invalid category fails
        res_cat = self.client.put(f'/api/expenses/{self.expense2.id}/', {
            'title': 'Updated Electricity Bill',
            'amount': '50.00',
            'category': 'InvalidCategory',
            'payment_method': 'Bank Transfer',
            'date': '2026-09-12',
        })
        self.assertEqual(res_cat.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('category', res_cat.data)

    def test_patch_partial_update_expense(self):
        payload = {'amount': '21.00'}
        response = self.client.patch(f'/api/expenses/{self.expense1.id}/', payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.expense1.refresh_from_db()
        self.assertEqual(self.expense1.amount, Decimal('21.00'))
        self.assertEqual(self.expense1.title, 'Healthy Lunch Bowl')

    def test_patch_invalid_amount_fails(self):
        res_neg = self.client.patch(f'/api/expenses/{self.expense1.id}/', {'amount': '-5.00'})
        self.assertEqual(res_neg.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('amount', res_neg.data)

        res_nonnum = self.client.patch(f'/api/expenses/{self.expense1.id}/', {'amount': 'invalid'})
        self.assertEqual(res_nonnum.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('amount', res_nonnum.data)

    def test_delete_expense(self):
        response = self.client.delete(f'/api/expenses/{self.expense3.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Expense.objects.count(), 2)

    def test_query_filter_by_category(self):
        response = self.client.get('/api/expenses/?category=Bills')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Monthly Electricity Bill')

    def test_query_search_by_title(self):
        response = self.client.get('/api/expenses/?search=lunch')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Healthy Lunch Bowl')

    def test_query_ordering(self):
        response = self.client.get('/api/expenses/?ordering=-amount')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['title'], 'Weekend Flight Ticket')
        self.assertEqual(response.data[-1]['title'], 'Healthy Lunch Bowl')

        response_asc = self.client.get('/api/expenses/?ordering=amount')
        self.assertEqual(response_asc.status_code, status.HTTP_200_OK)
        self.assertEqual(response_asc.data[0]['title'], 'Healthy Lunch Bowl')
        self.assertEqual(response_asc.data[-1]['title'], 'Weekend Flight Ticket')
