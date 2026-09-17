# 🧪 Expense Tracker - Manual Test Execution Matrix

This document logs the manual test matrix execution against the running application (Django REST API at `http://127.0.0.1:8000` and React Frontend at `http://localhost:5173`).

---

## 📊 Test Execution Results

| Test Case | Input | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Add valid expense** | `₹100, Food` | Expense created | **HTTP 201 Created**: Expense record created (`id: 8, title: "Lunch", amount: "100.00", category: "Food", payment_method: "UPI"`). Prepended to transaction list and running total incremented by ₹100.00. | ✅ **PASS** |
| **Empty title** | `Blank` (`""` or `"   "`) | Validation error | **HTTP 400 Bad Request**: Form submission blocked on frontend (`"Title is required and cannot be blank or whitespace-only."`); backend returns `{"title": ["Title cannot be blank or whitespace-only."]}` and displays inline error beneath input. | ✅ **PASS** |
| **Negative amount** | `-₹100` | Validation error | **HTTP 400 Bad Request**: Form submission blocked on frontend (`"Amount must be a positive number greater than 0."`); backend returns `{"amount": ["Ensure this value is greater than or equal to 0.01."]}` and displays inline error beneath input. | ✅ **PASS** |
| **View expenses** | `GET` | Expenses displayed | **HTTP 200 OK**: Expenses array returned and rendered in UI table/list with categories, payment methods, dates, and dynamic running total counter. | ✅ **PASS** |
| **Edit expense** | `₹100 → ₹150` | Updated | **HTTP 200 OK**: Row updated in place (`amount: "150.00"`). Form resets and total updates immediately without requiring a full page refresh. | ✅ **PASS** |
| **Delete expense** | `Valid ID` | Deleted | **HTTP 204 No Content**: Confirmation prompt displayed; on confirm, item is removed from database and UI, and running total is recalculated. | ✅ **PASS** |
| **Invalid ID** | `ID 9999` | Error message | **HTTP 404 Not Found**: Returns `{"detail": "Expense with ID '9999' was not found."}`. Frontend renders error banner without application crash. | ✅ **PASS** |
| **Backend down** | `N/A` (Backend offline/unreachable) | Frontend shows friendly error, not a crash | Network failure caught gracefully: Header status indicator turns red (`"Backend API Offline"`), persistent alert banner displays user-friendly error message, and UI remains fully responsive. | ✅ **PASS** |

---

## 🛠️ Issues Found & Resolved

1. **Client vs Server Timezone Calendar Dates**:
   - **Issue**: Clients located ahead of UTC (e.g. IST UTC+5:30) submitting their current calendar day (`2026-09-17`) were initially flagged as a future date by the backend because Django's `USE_TZ=True` was checking against `timezone.localdate()` in UTC (`2026-09-16`).
   - **Fix**: Updated [`backend/expenses/serializers.py`](file:///c:/Users/AdminTE/Documents/Expensive%20Tracker/backend/expenses/serializers.py) to validate against `max(date.today(), timezone.localdate())`, ensuring users across all timezones can record expenses on their current calendar date without false rejection.
2. **Currency Symbol Consistency**:
   - Updated frontend displays to format amounts with the Rupee symbol (`₹`) matching the test matrix.
3. **Empty Body on HTTP 204 No Content**:
   - Handled empty response body gracefully on DELETE operations so client-side response handlers do not trigger JSON parse errors.

---

## 🎯 Verification Summary

- **Backend automated test suite**: **16 / 16 tests passing** (`python manage.py test`).
- **Frontend production build**: Passed with 0 errors (`npm run build`).
- **Full End-to-End manual matrix**: **8 / 8 passed (100%)**.
