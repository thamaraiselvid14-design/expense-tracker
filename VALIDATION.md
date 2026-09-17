# 🛡️ Expense Tracker - Validation Summary & Matrix

This document outlines the validation rules enforced across both the **Django REST Framework Backend** and the **React + Vite Frontend**.

---

## 📋 Validation Rules & Enforcement Matrix

| Field | Rule / Constraint | Enforced Where | Violation Behavior |
| :--- | :--- | :---: | :--- |
| **Amount** | • Required<br>• Must be numeric decimal<br>• Strictly positive (`> 0.00`)<br>• Rejects `0`, negative numbers, non-numeric strings | **Both**<br>(Frontend & Backend) | • **Frontend**: Submission blocked; inline error: `"Amount must be a positive number greater than 0."`<br>• **Backend**: Rejects with `HTTP 400 Bad Request`: `{"amount": ["Amount must be greater than 0."]}` or `{"amount": ["Amount must be a valid numeric value."]}` |
| **Title** | • Required<br>• Max 100 characters<br>• Rejects empty string (`""`) and whitespace-only string (`"   "`) | **Both**<br>(Frontend & Backend) | • **Frontend**: Submission blocked; inline error: `"Title is required and cannot be blank or whitespace-only."`<br>• **Backend**: Rejects with `HTTP 400 Bad Request`: `{"title": ["Title cannot be blank or whitespace-only."]}` |
| **Date** | • Required<br>• Valid date format (`YYYY-MM-DD`)<br>• Rejects future dates (`date <= today`) | **Both**<br>(Frontend & Backend) | • **Frontend**: Submission blocked; inline error: `"Date cannot be in the future."`<br>• **Backend**: Rejects with `HTTP 400 Bad Request`: `{"date": ["Date cannot be in the future."]}` or `{"date": ["Date must be a valid date in YYYY-MM-DD format."]}` |
| **Category** | • Required<br>• Allowed choices only:<br>`Food`, `Shopping`, `Travel`, `Bills`, `Health`, `Other` | **Both**<br>(Frontend & Backend) | • **Frontend**: Select dropdown constrained; submission blocked if invalid.<br>• **Backend**: Rejects with `HTTP 400 Bad Request`: `{"category": ["\"...\" is not a valid category choice. Allowed: Food, Shopping, Travel, Bills, Health, Other."]}` |
| **Payment Method** | • Required<br>• Allowed choices only:<br>`Cash`, `UPI`, `Card`, `Bank Transfer` | **Both**<br>(Frontend & Backend) | • **Frontend**: Select dropdown constrained; submission blocked if invalid.<br>• **Backend**: Rejects with `HTTP 400 Bad Request`: `{"payment_method": ["\"...\" is not a valid payment method choice. Allowed: Cash, UPI, Card, Bank Transfer."]}` |
| **Description** | • Optional text notes | **Both** | • Accepted as optional string or blank. |

---

## ⚙️ Enforcement Architecture

### 1. Frontend Layer ([`ExpenseForm.jsx`](file:///c:/Users/AdminTE/Documents/Expensive%20Tracker/frontend/src/components/ExpenseForm.jsx) & [`ExpenseModal.jsx`](file:///c:/Users/AdminTE/Documents/Expensive%20Tracker/frontend/src/components/ExpenseModal.jsx))
- **Submission Blocking**:
  - In `handleSubmit(e)`, `e.preventDefault()` is invoked and `if (!validate()) return;` completely halts submission before dispatching any network request.
  - Invalid inputs receive an accessible `.form-error` span rendered directly under the corresponding field.
- **Backend 400 Error Handling (Never Swallowed)**:
  - When backend validation responds with `HTTP 400`, the `catch (err)` block parses `err.response.data`.
  - Field-level messages (`title`, `amount`, `date`, `category`, `payment_method`) are mapped to input state and rendered beneath each field.
  - General / non-field errors are displayed in top alert banners and toast notifications.
  - In [`Dashboard.jsx`](file:///c:/Users/AdminTE/Documents/Expensive%20Tracker/frontend/src/pages/Dashboard.jsx), the error is explicitly rethrown (`throw err`) so the form can bind and display inline error states.

### 2. Backend Layer ([`serializers.py`](file:///c:/Users/AdminTE/Documents/Expensive%20Tracker/backend/expenses/serializers.py) & [`models.py`](file:///c:/Users/AdminTE/Documents/Expensive%20Tracker/backend/expenses/models.py))
- **Model Constraints**:
  - `MinValueValidator(Decimal('0.01'))` on `amount`.
  - `choices=CATEGORY_CHOICES` and `choices=PAYMENT_METHOD_CHOICES`.
- **Serializer Validation & Custom Error Messages**:
  - `validate_title`: Rejects empty and whitespace-only strings with `"Title cannot be blank or whitespace-only."`.
  - `validate_amount`: Rejects values `<= 0` with `"Amount must be greater than 0."`. Non-numeric inputs are intercepted by `DecimalField` with `"Amount must be a valid numeric value."`.
  - `validate_date`: Rejects future calendar dates against `max(date.today(), timezone.localdate())` with `"Date cannot be in the future."`.
  - `extra_kwargs`: Configured with explicit human-readable error messages for invalid choices, formats, and missing fields.
- **CRUD Enforcement**:
  - `create` (POST), `update` (PUT), and `partial_update` (PATCH) all run full serializer validation with `raise_exception=True`.

---

## 🧪 Automated Test Verification

All rules are verified by **16 automated test cases** in [`backend/expenses/tests.py`](file:///c:/Users/AdminTE/Documents/Expensive%20Tracker/backend/expenses/tests.py):

| Test Case | Scenario Verified | HTTP Status |
| :--- | :--- | :---: |
| `test_create_expense_empty_or_whitespace_title_fails` | Title `""` or `"   "` rejected | 400 Bad Request |
| `test_create_expense_zero_negative_nonnumeric_amount_fails` | Amount `0`, `-10.50`, `"one-hundred"` rejected | 400 Bad Request |
| `test_create_expense_invalid_format_or_future_date_fails` | Future date or `"not-a-date"` rejected | 400 Bad Request |
| `test_create_expense_invalid_category_or_payment_method_choice_fails` | Choice outside allowed choices rejected | 400 Bad Request |
| `test_put_update_invalid_data_fails` | PUT with 0 amount, whitespace title, future date, or bad category rejected | 400 Bad Request |
| `test_patch_invalid_amount_fails` | PATCH with negative or non-numeric amount rejected | 400 Bad Request |
