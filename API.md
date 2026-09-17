# 🔌 Expense Tracker - REST API Documentation

Base URL: `http://127.0.0.1:8000/api/expenses/`  
Content-Type: `application/json`  
Authentication: Currently `AllowAny` (public development access)

---

## 📋 Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/expenses/` | Create a new expense record |
| **GET** | `/api/expenses/` | List all expenses (supports filtering, search, and sorting) |
| **GET** | `/api/expenses/<id>/` | Retrieve a single expense by ID |
| **PUT** | `/api/expenses/<id>/` | Fully update an existing expense |
| **PATCH** | `/api/expenses/<id>/` | Partially update an existing expense |
| **DELETE** | `/api/expenses/<id>/` | Delete an expense by ID |
| **GET** | `/api/expenses/summary/` | Get statistical analytics & category breakdown |

---

## 1. Create Expense

- **Method:** `POST`
- **Path:** `/api/expenses/`
- **Description:** Creates a new expense entry in the database.

### Request Body Example:
```json
{
  "title": "Grocery Shopping",
  "amount": "85.50",
  "category": "Food",
  "payment_method": "UPI",
  "date": "2026-09-17",
  "description": "Weekly fruits, vegetables, and milk"
}
```

### Success Response:
- **Status:** `201 Created`
```json
{
  "id": 1,
  "title": "Grocery Shopping",
  "amount": "85.50",
  "category": "Food",
  "payment_method": "UPI",
  "date": "2026-09-17",
  "description": "Weekly fruits, vegetables, and milk",
  "created_at": "2026-09-17T02:14:51.090917Z",
  "updated_at": "2026-09-17T02:14:51.090917Z"
}
```

### Error Responses:
- **Status:** `400 Bad Request` (Whitespace-only or blank title)
```json
{
  "title": [
    "Title cannot be blank or whitespace-only."
  ]
}
```

- **Status:** `400 Bad Request` (Zero or negative amount)
```json
{
  "amount": [
    "Amount must be greater than 0."
  ]
}
```

- **Status:** `400 Bad Request` (Non-numeric amount)
```json
{
  "amount": [
    "Amount must be a valid numeric value."
  ]
}
```

- **Status:** `400 Bad Request` (Future date)
```json
{
  "date": [
    "Date cannot be in the future."
  ]
}
```

- **Status:** `400 Bad Request` (Invalid category choice)
```json
{
  "category": [
    "\"Cryptocurrency\" is not a valid category choice. Allowed: Food, Shopping, Travel, Bills, Health, Other."
  ]
}
```

- **Status:** `400 Bad Request` (Invalid payment method choice)
```json
{
  "payment_method": [
    "\"Bitcoin\" is not a valid payment method choice. Allowed: Cash, UPI, Card, Bank Transfer."
  ]
}
```

---

## 2. List Expenses

- **Method:** `GET`
- **Path:** `/api/expenses/`
- **Query Parameters:**
  - `category` *(optional)*: Filter by category (e.g., `?category=Food`). Set to `All` or omit to retrieve all categories.
  - `search` *(optional)*: Search keyword matched against `title` or `description` case-insensitively (e.g., `?search=lunch`).
  - `ordering` *(optional)*: Sort results by field. Allowed: `date`, `-date`, `amount`, `-amount`, `title`, `-title`, `created_at`, `-created_at`. Defaults to `-date`.

### Request Example:
```http
GET /api/expenses/?category=Food&ordering=-amount HTTP/1.1
Host: 127.0.0.1:8000
Accept: application/json
```

### Success Response:
- **Status:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Grocery Shopping",
    "amount": "85.50",
    "category": "Food",
    "payment_method": "UPI",
    "date": "2026-09-17",
    "description": "Weekly fruits, vegetables, and milk",
    "created_at": "2026-09-17T02:14:51.090917Z",
    "updated_at": "2026-09-17T02:14:51.090917Z"
  },
  {
    "id": 2,
    "title": "Dinner at Cafe",
    "amount": "45.00",
    "category": "Food",
    "payment_method": "Card",
    "date": "2026-09-16",
    "description": "Pasta and coffee",
    "created_at": "2026-09-16T18:30:00.000000Z",
    "updated_at": "2026-09-16T18:30:00.000000Z"
  }
]
```

---

## 3. Retrieve Expense by ID

- **Method:** `GET`
- **Path:** `/api/expenses/<id>/`
- **Description:** Returns the details of a specific expense record.

### Success Response:
- **Status:** `200 OK`
```json
{
  "id": 1,
  "title": "Grocery Shopping",
  "amount": "85.50",
  "category": "Food",
  "payment_method": "UPI",
  "date": "2026-09-17",
  "description": "Weekly fruits, vegetables, and milk",
  "created_at": "2026-09-17T02:14:51.090917Z",
  "updated_at": "2026-09-17T02:14:51.090917Z"
}
```

### Error Response:
- **Status:** `404 Not Found` (Non-existent expense ID)
```json
{
  "detail": "Expense with ID '9999' was not found."
}
```

---

## 4. Full Update (PUT)

- **Method:** `PUT`
- **Path:** `/api/expenses/<id>/`
- **Description:** Replaces all fields of an existing expense record. All required fields must be supplied.

### Request Body Example:
```json
{
  "title": "Whole Foods Grocery Haul",
  "amount": "120.00",
  "category": "Food",
  "payment_method": "Card",
  "date": "2026-09-17",
  "description": "Updated grocery list with organic items"
}
```

### Success Response:
- **Status:** `200 OK`
```json
{
  "id": 1,
  "title": "Whole Foods Grocery Haul",
  "amount": "120.00",
  "category": "Food",
  "payment_method": "Card",
  "date": "2026-09-17",
  "description": "Updated grocery list with organic items",
  "created_at": "2026-09-17T02:14:51.090917Z",
  "updated_at": "2026-09-17T02:20:10.123456Z"
}
```

### Error Response:
- **Status:** `400 Bad Request` (Missing required field during full update)
```json
{
  "title": [
    "Title is required."
  ]
}
```

---

## 5. Partial Update (PATCH)

- **Method:** `PATCH`
- **Path:** `/api/expenses/<id>/`
- **Description:** Updates one or more fields without requiring the full payload.

### Request Body Example:
```json
{
  "amount": "135.50"
}
```

### Success Response:
- **Status:** `200 OK`
```json
{
  "id": 1,
  "title": "Whole Foods Grocery Haul",
  "amount": "135.50",
  "category": "Food",
  "payment_method": "Card",
  "date": "2026-09-17",
  "description": "Updated grocery list with organic items",
  "created_at": "2026-09-17T02:14:51.090917Z",
  "updated_at": "2026-09-17T02:22:15.654321Z"
}
```

### Error Response:
- **Status:** `400 Bad Request` (Invalid partial field value)
```json
{
  "amount": [
    "Amount must be greater than 0."
  ]
}
```

---

## 6. Delete Expense

- **Method:** `DELETE`
- **Path:** `/api/expenses/<id>/`
- **Description:** Permanently deletes the expense record with the specified ID.

### Success Response:
- **Status:** `204 No Content`
*(Empty response body)*

### Error Response:
- **Status:** `404 Not Found`
```json
{
  "detail": "Expense with ID '9999' was not found."
}
```

---

## 7. Analytics Summary

- **Method:** `GET`
- **Path:** `/api/expenses/summary/`
- **Description:** Aggregates financial analytics including overall expenditures, current month spending, transaction count, average per transaction, peak expense, and percentage breakdown by category.

### Success Response:
- **Status:** `200 OK`
```json
{
  "total_spent": 504.20,
  "total_count": 3,
  "current_month_spent": 504.20,
  "current_month_count": 3,
  "average_expense": 168.07,
  "highest_expense": 450.00,
  "category_breakdown": [
    {
      "category": "Travel",
      "total": 450.00,
      "count": 1,
      "percentage": 89.3
    },
    {
      "category": "Food",
      "total": 54.20,
      "count": 2,
      "percentage": 10.7
    }
  ]
}
```

---

## 🛡️ Allowed Enum Choices Reference

### Categories (`category`):
- `Food`
- `Shopping`
- `Travel`
- `Bills`
- `Health`
- `Other`

### Payment Methods (`payment_method`):
- `Cash`
- `UPI`
- `Card`
- `Bank Transfer`
