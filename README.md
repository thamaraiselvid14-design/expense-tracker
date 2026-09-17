# 💰 Expense Tracker - Full-Stack Financial Management Application

A modern, decoupled web application built with **Django REST Framework (DRF)** and **React + Vite** for personal financial management, expense tracking, and spending analytics.

---

## 📖 Overview

The **Expense Tracker** provides individuals with an intuitive, reliable, and responsive platform to log daily financial transactions, categorize expenditures, monitor payment methods, and visualize spending habits in real time. Designed with a decoupled architecture, it pairs a resilient Python REST API backend with a high-performance React user interface.

---

## 🚩 Problem Statement

Managing personal finances often involves tracking fragmented purchases across multiple payment methods (UPI, Cards, Cash, Bank Transfers). Without a centralized and structured system, users experience:
- Lack of visibility into categorical spending (food, bills, transit, shopping).
- Difficulties maintaining records without data loss or entry errors.
- Unreliable tracking platforms that fail silently, swallow network errors, or lack robust input validation.
- Complicated financial tools with heavy overhead rather than instant, real-time insights.

---

## 🎯 Objectives

1. **Streamlined Expense Entry:** Rapid recording of expenses with immediate client-side validation and server-enforced data integrity.
2. **Granular Categorization & Payment Tagging:** Categorize expenses (`Food`, `Shopping`, `Travel`, `Bills`, `Health`, `Other`) and track payment instruments (`Cash`, `UPI`, `Card`, `Bank Transfer`).
3. **Data Integrity & Robust Security:** Server-side validation rejecting invalid dates, negative/zero amounts, and whitespace inputs; 100% ORM access to eliminate SQL injection; zero committed credentials.
4. **Live Feedback & Error Transparency:** Clear user-facing alerts and inline validation errors for all 400 Bad Request and network responses.
5. **Real-Time Financial Analytics:** Instant calculation of running totals, monthly metrics, average transaction size, and category distributions.

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Django 5.x & Django REST Framework (DRF) 3.15+
- **Language:** Python 3.11+
- **Database Engine:** Dual support for **MySQL** (production) and **SQLite** (instant local development)
- **CORS Handling:** `django-cors-headers`
- **Configuration & Security:** `python-decouple` for decoupled `.env` management

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 5
- **HTTP Client:** Axios with centralized interceptors and instance config
- **Icons:** Lucide-react
- **Styling:** Custom CSS design system featuring dark mode glassmorphism, responsive CSS grid, and micro-animations

---

## 🏗️ Architecture & Data Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                       USER BROWSER                          │
│                React 18 + Vite (SPA Client)                 │
│                   http://localhost:5173                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ JSON / HTTP (REST API)
                               │ Axios (Base: http://127.0.0.1:8000)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   DJANGO REST FRAMEWORK                     │
│                http://127.0.0.1:8000/api/expenses/          │
├─────────────────────────────────────────────────────────────┤
│ • CorsMiddleware (Allowed origins: localhost:5173)          │
│ • URL Routing (config/urls.py -> expenses/urls.py)          │
│ • ExpenseViewSet (ModelViewSet: CRUD + Query Filters)       │
│ • ExpenseSerializer (Field validations & Error Mappings)    │
│ • Analytics Action (/api/expenses/summary/)                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ Django ORM (Parameterized Queries)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                         │
│               MySQL 8.0+  /  SQLite (dev default)           │
│        Tables: expenses_expense, auth_*, django_session     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup & Installation Guide

### Prerequisites
- **Python 3.11+** installed (`python --version`)
- **Node.js 18+** & **npm** installed (`node --version`)
- *(Optional)* **MySQL Server 8.0+** if choosing MySQL over the default SQLite.

---

### Step 1: Clone or Navigate to Project Directory

```bash
cd "Expensive Tracker"
```

---

### Step 2: Backend Setup (Django + DRF)

1. **Navigate to the `backend/` directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - **Windows (PowerShell):**
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows (Command Prompt):**
     ```cmd
     venv\Scripts\activate.bat
     ```
   - **macOS / Linux:**
     ```bash
     source venv/bin/activate
     ```

4. **Install backend dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure Environment Variables (`.env`):**
   Copy `.env.example` to create your local `.env`:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env

   # macOS / Linux
   cp .env.example .env
   ```

   *By default, `DB_ENGINE=django.db.backends.sqlite3` is enabled for zero-configuration startup. To use MySQL, set `DB_ENGINE=django.db.backends.mysql` and provide your MySQL credentials in `.env`.*

6. **Run Database Migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **Verify Automated Tests (16 passing tests):**
   ```bash
   python manage.py test
   ```

---

### Step 3: Frontend Setup (React + Vite)

1. **Open a separate terminal and navigate to `frontend/`:**
   ```bash
   cd frontend
   ```

2. **Install Node modules:**
   ```bash
   npm install
   ```

3. **Configure Frontend Environment (`.env`):**
   Copy `frontend/.env.example` to create `frontend/.env`:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env

   # macOS / Linux
   cp .env.example .env
   ```
   *(Ensure `VITE_API_URL=http://127.0.0.1:8000/api/expenses` is set)*

4. **Verify Frontend Build:**
   ```bash
   npm run build
   ```

---

## ⚡ Running the Application

To run the full stack, start both development servers:

### Terminal 1: Start Backend (Django)
```bash
cd backend
.\venv\Scripts\Activate.ps1   # or source venv/bin/activate
python manage.py runserver 127.0.0.1:8000
```
- **Backend API:** [http://127.0.0.1:8000/api/expenses/](http://127.0.0.1:8000/api/expenses/)
- **API Summary Action:** [http://127.0.0.1:8000/api/expenses/summary/](http://127.0.0.1:8000/api/expenses/summary/)

### Terminal 2: Start Frontend (Vite)
```bash
cd frontend
npm run dev
```
- **Frontend Web UI:** [http://localhost:5173](http://localhost:5173)

---

## 🛡️ Validation & Security Matrix

- **Zero committed credentials:** Protected via `.gitignore`.
- **Zero raw SQL:** 100% Django ORM parameterized queries.
- **Bi-layer validation:** Both frontend client and backend serializer enforce non-whitespace titles, positive amounts (`> 0.00`), non-future dates, and enum constraints.
- Detailed validation rules: See [**`VALIDATION.md`**](file:///VALIDATION.md).
- Security audit and test logs: See [**`SECURITY.md`**](file:///SECURITY.md) and [**`TESTING.md`**](file:///TESTING.md).
- REST API endpoint specifications: See [**`API.md`**](file:///API.md).

---

## 🔮 Future Enhancements

The following roadmap items are planned for subsequent releases:

1. **User Authentication & Multi-Tenancy:**
   - User registration and login using JWT (`djangorestframework-simplejwt`).
   - Private expense isolation where records are bound to authenticated user accounts (`user = models.ForeignKey(User)`).
2. **Monthly Budget Limits & Alerts:**
   - Configurable category and monthly spending caps.
   - Dynamic visual warning indicators when spending nears 80% or exceeds 100% of the threshold.
3. **Interactive Charts & Visualizations:**
   - Donut charts for category breakdown and bar graphs for daily/weekly spending trends using Chart.js or Recharts.
4. **Export to PDF & Excel:**
   - One-click export of filtered transaction histories into `.xlsx` spreadsheets and formatted `.pdf` financial statements.
5. **Recurring Expenses & Subscriptions:**
   - Automation for recurring monthly bills (rent, subscriptions, utilities) with automated scheduled creation.
