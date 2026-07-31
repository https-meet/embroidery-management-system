# 🚀 EBMS Deployment Guide & Environment Architecture

This document provides complete instructions for deploying the **Embroidery Business Management System (EBMS)** across **Development**, **Public Demo Sandbox**, and **Production** environments.

---

## 🌐 1. Environment Determination Logic

EBMS determines its operational environment at runtime based on environment variables set in the host environment (Render, Vercel, or local `.env`):

```
                               ┌───────────────────────────────────┐
                               │   APPLICATION INITIALIZATION      │
                               └─────────────────┬─────────────────┘
                                                 │
                   ┌─────────────────────────────┼─────────────────────────────┐
                   ▼                             ▼                             ▼
     ┌───────────────────────────┐ ┌───────────────────────────┐ ┌───────────────────────────┐
     │ 1. DEVELOPMENT            │ │ 2. PUBLIC DEMO SANDBOX    │ │ 3. PRODUCTION             │
     │ • NODE_ENV=development    │ │ • NODE_ENV=production     │ │ • NODE_ENV=production     │
     │ • IS_DEMO_MODE=false      │ │ • IS_DEMO_MODE=true       │ │ • IS_DEMO_MODE=false      │
     │                           │ │                           │ │                           │
     │ • Local Workstation       │ │ • Public Vercel & Render  │ │ • Private Vercel & Render │
     │ • Local Database          │ │ • Isolated Demo Database  │ │ • Real Business Database  │
     │ • Full Local Features     │ │ • Full Demo Testing       │ │ • 100% Private Business   │
     │                           │ │ • Destructive Admin       │ │   Records & Customers     │
     │                           │ │   Actions Intercepted     │ │                           │
     └───────────────────────────┘ └───────────────────────────┘ └───────────────────────────┘
```

### Environment Matrix Table

| Environment | `NODE_ENV` | `IS_DEMO_MODE` | Database | Target Audience | Key Behavior |
|---|---|---|---|---|---|
| **Development** | `development` | `false` / `undefined` | Local Postgres / SQLite | Developers | Full local debugging & hot reload. |
| **Demo Sandbox** | `production` | `true` | Isolated Sandbox DB | LinkedIn, Recruiters, Clients | Full operational feature testing (Jobs, Invoices, Payments, DST uploads, QC). Destructive system config mutations return HTTP 403. |
| **Production** | `production` | `false` | Real Business DB | Business Owner & Staff | 100% private, real business transactions, custom non-default JWT secrets enforced. |

---

## ⚙️ 2. `IS_DEMO_MODE` Configuration & Behavior

`IS_DEMO_MODE` is a boolean flag set in backend environment configuration (`apps/backend/.env` or Render Dashboard):

```env
IS_DEMO_MODE=true
```

### What Happens When `IS_DEMO_MODE=true` is Active:
1. **Full Operational Exploration Enabled**: Public visitors logging into the Demo Sandbox can freely test:
   - Creating sample customers & editing contact info
   - Creating embroidery job orders & setting priorities
   - Uploading Tajima `.DST` files & viewing real-time canvas stitch previews
   - Recording Quality Checks (`PASSED` / `FAILED` status)
   - Generating & printing GST Tax Invoices
   - Recording payment allocations & viewing analytics reports
2. **Administrative Mutation Guard (`demoGuard.ts`)**: If a public demo user attempts to modify company tax settings or trigger database backup dumps, `demoGuard` intercepts the HTTP request and returns:
   > `403 Forbidden`: `🔒 Demo Sandbox Mode: This administrative configuration is disabled in the public demonstration.`

---

## 🔑 3. Configuring Demo Credentials (`DEMO_EMAIL` & `DEMO_PASSWORD`)

Demo credentials are **never hardcoded in source code**. They are injected during deployment via environment variables:

```env
# Demo Environment Variables (Set in Render Dashboard for Demo Web Service)
DEMO_EMAIL=demo@ebms.com
DEMO_PASSWORD=demo123
```

When executing `pnpm prisma db seed` on the Demo Sandbox database, the seed script reads `DEMO_EMAIL` and `DEMO_PASSWORD` from the environment and creates the demo user account automatically.

---

## 🛠️ 4. Automated Nightly Demo Reset

To keep the public demo sandbox clean without requiring manual intervention, configure a Render Cron Job or GitHub Action to execute every night at **02:00 AM UTC**:

```bash
# Automated Nightly Seed Reset Command for Demo Sandbox DB
cd apps/backend && pnpm prisma migrate reset --force && pnpm prisma db seed
```

---

## 🔒 5. Deploying to Production (Render & Vercel)

### Step 1: Render Backend Deployment (Production Service)
1. Create a **Web Service** on Render connected to your Git repository.
2. Set Environment Variables:
   - `NODE_ENV=production`
   - `IS_DEMO_MODE=false`
   - `DATABASE_URL=postgresql://user:pass@host/prod_db`
   - `JWT_ACCESS_SECRET=<custom-32-character-secret>`
   - `JWT_REFRESH_SECRET=<custom-32-character-secret>`
   - `CORS_ORIGIN=https://ebms-app.vercel.app`
3. Build Command: `pnpm --filter @ebms/backend build`
4. Start Command: `pnpm --filter @ebms/backend start`

### Step 2: Vercel Frontend Deployment (Production Frontend)
1. Create a **Project** on Vercel connected to your Git repository.
2. Set Environment Variables:
   - `VITE_API_BASE_URL=https://your-render-prod-backend.onrender.com/api/v1`
   - `VITE_ENV_MODE=production`
3. Framework Preset: **Vite**.

---
*Documentation compiled for EBMS v1.0 Release.*
