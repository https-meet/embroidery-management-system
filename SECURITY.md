# 🔒 EBMS Security Architecture & Policy

This document outlines the security controls, environment variable management, database isolation architecture, and vulnerability prevention policies implemented in the **Embroidery Business Management System (EBMS)**.

---

## 1. 🛡️ Secret Management & Environment Hygiene

EBMS enforces a strict zero-trust credential strategy:

- **No Secrets in Source Code**: Zero production passwords, API keys, database connection URIs, SMTP credentials, or secret tokens exist in tracked Git files.
- **Environment Variable Validation (`apps/backend/src/config/env.schema.ts`)**:
  - The backend uses Zod schema validation to parse `process.env`.
  - In `production` mode (when `IS_DEMO_MODE=false`), the application **refuses to start** if default fallback strings are used for `JWT_ACCESS_SECRET` or `JWT_REFRESH_SECRET`.
  - Production secrets must be at least 32 characters long.
- **Git Exclusions (`.gitignore`)**:
  - Automatically excludes `.env`, `*.pem`, `*.key`, `*.crt`, `backups/`, `*.sql`, `scratch/`, and `*.log` files from version control.
- **Template Placeholders (`.env.example`)**:
  - Repository contains `.env.example` templates with generic placeholder strings only.

---

## 2. 🏛️ Database Air-Gap Isolation Architecture

EBMS guarantees absolute privacy and security by maintaining two completely isolated database environments:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  PRODUCTION ENVIRONMENT (Private)                                                               │
│  • Connected to REAL Business Database (Supabase / Render PostgreSQL)                           │
│  • Accessible ONLY by Business Owner & Authorized Staff via Secret Credentials                   │
│  • Real Customer Contacts, Real GST Tax Invoices, Real Financial Revenue                         │
│  • 100% Private, Encrypted, and Air-Gapped from Public Internet                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  PUBLIC DEMO SANDBOX (Public)                                                                    │
│  • Connected to ISOLATED Sandbox Database (Pre-seeded with sample data from seed.ts)            │
│  • Accessible by LinkedIn Reviewers, Recruiters, and Clients via DEMO_EMAIL / DEMO_PASSWORD     │
│  • Full Operational Testing (Orders, Invoices, DST Uploads, QC) Enabled                          │
│  • Destructive Admin Actions (Deleting system users, changing tax settings) Blocked via Guard   │
│  • Automated Nightly Reset (02:00 UTC)                                                           │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 🔑 Authentication & Authorization Controls

- **JWT Access & Refresh Tokens**: Short-lived access tokens (15m) paired with HTTP-only refresh tokens (7d).
- **Password Hashing**: Passwords are hashed using `bcrypt` with configurable salt rounds (default: 10).
- **Environment-Aware Demo Guard (`demoGuard.ts`)**:
  - When `IS_DEMO_MODE=true` is set, administrative endpoints (user management, tax config modification, system backup dumps) are intercepted by `demoGuard` and return HTTP 403 Forbidden.

---

## 4. 🩺 Deployment Health Monitoring (`GET /health`)

- **Unauthenticated Endpoint**: `GET /health` and `GET /api/v1/health`.
- **Functionality**: Performs a database ping (`SELECT 1`) to report API and database status without exposing sensitive system internal configurations.

---

## 5. 🚨 Vulnerability Reporting

If you discover any security issues or vulnerabilities, please contact the lead developer directly instead of opening a public issue.

---
*Documented for EBMS v1.0 Production Readiness.*
