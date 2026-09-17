# 🔒 Expense Tracker - Security Assessment & Posture Review

This document provides a security review of the Expense Tracker application, evaluating secret handling, injection defenses, server-side validation integrity, production readiness, and remaining gaps.

---

## 1. Credentials & Secret Management

- **Zero Hardcoded Secrets**: A static scan of all source files confirmed no hardcoded passwords, API tokens, or Django secret keys.
- **Environment Decoupling**:
  - All sensitive parameters (`SECRET_KEY`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`) are loaded dynamically via `python-decouple` from `backend/.env`.
  - Frontend endpoints are configured via `VITE_API_URL` from `frontend/.env`.
- **`.gitignore` Enforced**:
  - [`.gitignore`](file:///c:/Users/AdminTE/Documents/Expensive%20Tracker/.gitignore) excludes `.env`, `backend/.env`, `frontend/.env`, `*.env.local`, and SQLite files (`*.sqlite3`, `*.db`).
  - Only template files with placeholder values are tracked in version control ([`backend/.env.example`](file:///c:/Users/AdminTE/Documents/Expensive%20Tracker/backend/.env.example) and [`frontend/.env.example`](file:///c:/Users/AdminTE/Documents/Expensive%20Tracker/frontend/.env.example)).

---

## 2. SQL Injection Prevention & Database Layer

- **100% ORM Access**: All queries are executed strictly through Django ORM methods (`Expense.objects.all()`, `filter()`, `aggregate()`, `annotate()`, `order_by()`).
- **Zero Raw SQL**: Verified **0 occurrences** of `raw()`, `cursor.execute()`, or `extra()` across the backend codebase.
- **Safe Parameterization**: Django ORM automatically parameterizes all queries and escapes input before dispatching SQL to the underlying SQLite / MySQL engine.

---

## 3. Production Readiness & Configuration

- **Configurable `DEBUG` Mode**:
  - `DEBUG = config('DEBUG', default=True, cast=bool)` in [`backend/config/settings.py`](file:///c:/Users/AdminTE/Documents/Expensive%20Tracker/backend/config/settings.py).
  - Setting `DEBUG=False` disables debug pages and stack traces.
- **Configurable `ALLOWED_HOSTS`**:
  - Dynamically read via `config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())`.
- **Configurable `CORS_ALLOWED_ORIGINS`**:
  - Restricts cross-origin requests to explicit domains (`localhost:5173` in development; custom domains in production).
- **Security Headers Activated on `DEBUG=False`**:
  - `SECURE_BROWSER_XSS_FILTER = True`
  - `SECURE_CONTENT_TYPE_NOSNIFF = True`
  - `X_FRAME_OPTIONS = 'DENY'` (Clickjacking prevention)
  - `SESSION_COOKIE_SECURE = True`
  - `CSRF_COOKIE_SECURE = True`
  - `SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=False, cast=bool)`

---

## 4. Server-Side Validation Integrity

Even though client-side form validation blocks invalid submissions in React, the backend validates every request independently:
- **Full CRUD Coverage**: `create` (POST), `update` (PUT), and `partial_update` (PATCH) in [`backend/expenses/views.py`](file:///c:/Users/AdminTE/Documents/Expensive%20Tracker/backend/expenses/views.py) execute `serializer.is_valid(raise_exception=True)`.
- **Validation Rules**:
  - **Amount**: Rejects `0`, negative numbers (`value <= 0`), and non-numeric values with `HTTP 400`.
  - **Title**: Rejects empty strings and whitespace-only strings (`not value.strip()`) with `HTTP 400`.
  - **Date**: Rejects malformed strings and future dates (`value > max(date.today(), timezone.localdate())`) with `HTTP 400`.
  - **Choices**: Rejects category or payment method inputs outside the defined choice lists with `HTTP 400`.
- **Verified by Automated Tests**: **16 / 16 automated tests passing** in [`backend/expenses/tests.py`](file:///c:/Users/AdminTE/Documents/Expensive%20Tracker/backend/expenses/tests.py).

---

## 5. Remaining Security Gaps & Recommendations

Before deploying to a public production environment, the following areas should be implemented:

| Priority | Security Area | Current State | Production Action Required |
| :---: | :--- | :--- | :--- |
| **High** | **Authentication & Multi-Tenancy** | Public API (`AllowAny` permission). All users share the same database records. | Implement JWT (via `djangorestframework-simplejwt`) or Session Auth. Associate each expense with a `User` foreign key (`user = models.ForeignKey(User, on_delete=models.CASCADE)`) and filter querysets by `request.user`. |
| **Medium** | **Rate Limiting & Throttling** | No rate limits configured. | Add DRF `DEFAULT_THROTTLE_CLASSES` (`AnonRateThrottle`, `UserRateThrottle`) in `settings.py` to prevent brute-force attacks and resource exhaustion. |
| **Medium** | **Secret Key Regeneration** | Placeholder secret key in development `.env`. | Generate a 50+ character cryptographically random `SECRET_KEY` via `secrets.token_urlsafe(50)` on the production server. |
| **Medium** | **HTTPS & HSTS** | Local plain HTTP. | Terminate TLS/SSL at a reverse proxy (Nginx, Caddy, AWS ALB) and set `SECURE_SSL_REDIRECT=True` and `SECURE_HSTS_SECONDS=31536000`. |
| **Low** | **Database Connection Encryption** | Unencrypted local socket / loopback TCP. | In remote MySQL deployments, enforce SSL (`OPTIONS: {'ssl': {'ca': ...}}`) in `DATABASES`. |
| **Low** | **Content Security Policy (CSP)** | Standard Django headers only. | Integrate `django-csp` to prevent unauthorized inline script and asset injection. |
