# Embroidery Business Management System (EBMS)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg?style=flat-square&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0-4169E1.svg?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.2-2D3748.svg?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

EBMS is a full-stack business management application for embroidery businesses. It helps teams manage the complete operational workflow: customers, embroidery designs, jobs, production progress, invoices, payments, reports, and business settings.

The project is built as a TypeScript pnpm workspace with a React frontend, an Express API, Prisma ORM, and PostgreSQL. It is organized around business features rather than generic technical layers, making the system easier to understand, extend, and maintain.

---

## 🌟 Highlights

- **Full-stack TypeScript**: React 19, Express, Prisma ORM, and PostgreSQL.
- **Feature-Based Architecture**: Modular frontend and backend codebase organized by business domain.
- **Enterprise Design System**: Commercial UI/UX with HSL color tokens, dark mode, light mode, and keyboard-first accessibility.
- **JWT & Role-Based Security**: Access/refresh token flow with `ADMIN`, `MANAGER`, and `OPERATOR` roles.
- **End-to-End Embroidery Lifecycle**: Customer intake → Design catalog → Job tracking → Production queue → Quality inspection → Tax invoice → Payment settlement.
- **Production-Ready Quality**: Complete workspace scripts for build, type checking, linting, testing, and offline disaster recovery backups.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Business Workflow](#business-workflow)
- [Screenshots](#screenshots)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Build and Quality Checks](#build-and-quality-checks)
- [API Overview](#api-overview)
- [Documentation Links](#documentation-links)
- [Future Roadmap](#future-roadmap)
- [License](#license)
- [Author](#author)

---

## 🎯 Project Overview

Embroidery businesses often manage work across notebooks, phone calls, WhatsApp messages, design files, and memory. EBMS centralizes that information into one operational system.

The application supports:

- Customer records and contact details
- Embroidery design catalog management
- Job and job-item tracking
- Production queue management
- Operator assignment and production status changes
- Invoice creation and cancellation
- Payment recording and allocation
- Dashboard summaries
- Business reports
- Local business profile and preference settings

---

## 🚀 Key Features

### Authentication and Authorization

- User registration and login
- JWT access and refresh token flow
- Protected frontend routes & backend API routes
- Role-based access control for `ADMIN`, `MANAGER`, and `OPERATOR`

### Customers & Customer 360

- Create, view, update, list, search, and archive customers
- Customer codes and type support for individuals and companies
- Customer 360 Workspace consolidating profile, active jobs, outstanding balance, and activity stream

### Designs Catalog

- Create, view, update, list, search, and archive embroidery designs
- Design codes and category filtering
- Design metadata such as stitch count, dimensions, color count, preview URL, and file URL

### Job Orders

- Create, view, update, list, and archive jobs
- Multiple job items per job with position placement, stitch count, quantity, and rate
- Job priority (`LOW`, `NORMAL`, `HIGH`, `URGENT`) and lifecycle status
- Automatic line-total handling through the business workflow

### Production & Quality Control

- Real-time production queue
- Operator assignment (`OPERATOR` role)
- Stage transitions: Start → Complete → Quality Check → Deliver

### Invoices & Tax Billing

- Create, view, update, list, and cancel invoices
- Invoice items, percentage or fixed discount, subtotal, and tax calculation
- Outstanding balance tracking and printable tax invoice view

### Payments & Collections

- Create, view, and list payments
- Payment methods: Cash, UPI, Bank Transfer, and Cheque
- Automatic invoice balance updates and payment allocations

### Dashboard & Reports

- Real-time operational KPI summaries (Jobs Due Today, Delayed Jobs Alert, Pending Collections, Monthly Revenue)
- Embedded tables for Today's Production Queue, Payment Follow-up, and Recent Activity Stream
- Specialized reports for customers, jobs, production, invoices, payments, and revenue

### Settings, Diagnostics & Backups

- Business profile, GSTIN, banking details, and invoice footer configuration
- User permissions matrix and security settings
- Immutable Audit Trail tracking all user and financial actions
- System Health diagnostic monitor (DB latency, server uptime, database record counts)
- Offline Disaster Recovery Backup Hub (JSON database snapshot & CSV transaction ledger)

---

## 🔄 Business Workflow

EBMS follows the real operational flow of an embroidery business:

```text
Customer
  -> Design
  -> Job
  -> Job Items
  -> Production Queue
  -> Production Completion
  -> Quality Check
  -> Invoice
  -> Payment
  -> Dashboard & Reports
```

The workflow keeps customer, production, and financial information connected so users can track work from the first customer interaction through final payment.

---

## 🖼️ Screenshots

### Authentication & Split-Screen Login
![Authentication & Split-Screen Login](screenshots/01_login_screen.png)

### Operational Dashboard
![Operational Dashboard](screenshots/02_operational_dashboard.png)

### Customer 360 Hub
![Customer 360 Hub](screenshots/03_customer_360_hub.png)

### Job Orders Workspace
![Job Orders Workspace](screenshots/04_job_orders_workspace.png)

### Invoices & Tax Billing
![Invoices & Tax Billing](screenshots/05_printable_tax_invoice.png)

### Global Search & Command Palette Modal
![Global Search & Command Palette Modal](screenshots/06_global_search_modal.png)

### Commercial Settings & System Health
![Commercial Settings & System Health](screenshots/07_commercial_settings_hub.png)

### Reports & Offline Backup Hub
![Reports & Offline Backup Hub](screenshots/08_reports_backup_hub.png)


---

## 📐 Architecture Overview

EBMS uses a modular full-stack architecture.

```mermaid
flowchart LR
  Browser["Browser / React UI"] --> Routes["React Router Routes"]
  Routes --> Features["Frontend Feature Modules"]
  Features --> Query["TanStack Query Hooks"]
  Query --> Axios["Axios API Client"]
  Axios --> API["Express REST API /api/v1"]
  API --> Middleware["Auth, RBAC, Zod Validation"]
  Middleware --> Controllers["Module Controllers"]
  Controllers --> Services["Business Services"]
  Services --> Repositories["Repositories"]
  Repositories --> Prisma["Prisma ORM"]
  Prisma --> Database[("PostgreSQL")]
```

### Frontend Architecture

The frontend is organized by feature under `apps/frontend/src/features`. Each feature owns:
- `api`
- `components`
- `hooks`
- `pages`
- `schemas`
- `types`

Shared frontend code lives under `apps/frontend/src/shared`, including reusable UI components, hooks, constants, API utilities, query configuration, providers, and formatting helpers. Routing is centralized in `apps/frontend/src/routes/AppRoutes.tsx` using `React.lazy()` and `Suspense`.

### Backend Architecture

The backend is organized by business module under `apps/backend/src/modules`. Each module follows a consistent structure:
- `router`
- `controller`
- `service`
- `repository`
- `schema`
- `types`
- `__tests__` where applicable

The backend exposes a versioned REST API under `/api/v1`, validates requests with Zod, applies authentication and role checks through middleware, and persists data through Prisma and PostgreSQL.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19, Vite
- **Language**: TypeScript 5.7
- **Routing & Querying**: React Router v7, TanStack Query v5, Axios
- **Form & Validation**: React Hook Form, Zod
- **Styling & Icons**: Tailwind CSS v3.4, Lucide React, Sonner

### Backend
- **Runtime & Framework**: Node.js, Express v4.21
- **Language**: TypeScript 5.7
- **Database & ORM**: PostgreSQL 16, Prisma ORM v6.2
- **Auth & Security**: JWT, bcryptjs, Zod
- **Testing**: Vitest v4.1, Supertest

### Workspace and Tooling
- pnpm workspaces
- ESLint flat config
- Prettier
- Shared TypeScript configuration

---

## 📁 Repository Structure

```text
.
|-- apps
|   |-- backend
|   |   |-- prisma
|   |   |   |-- migrations
|   |   |   `-- schema.prisma
|   |   `-- src
|   |       |-- config
|   |       |-- lib
|   |       |-- middleware
|   |       |-- modules
|   |       |-- routes
|   |       |-- types
|   |       |-- utils
|   |       |-- app.ts
|   |       `-- server.ts
|   `-- frontend
|       `-- src
|           |-- app
|           |-- config
|           |-- features
|           |-- layouts
|           |-- routes
|           |-- shared
|           |-- App.tsx
|           `-- main.tsx
|-- docs
|   |-- AI_ENGINEERING_GUIDE.md
|   |-- PROJECT_CONTEXT.md
|   `-- developer-kit
|-- packages
|   |-- config
|   `-- shared
|-- .env.example
|-- package.json
|-- pnpm-lock.yaml
`-- pnpm-workspace.yaml
```

---

## ⚡ Quick Start & Installation

### Prerequisites

- Node.js 20 or newer
- pnpm 9 or newer
- PostgreSQL 16 or newer

### 1. Install Dependencies

From the repository root:

```bash
pnpm install
```

### 2. Database Setup

Create a PostgreSQL database for the application:

```sql
CREATE DATABASE ebms;
```

Generate the Prisma client:

```bash
pnpm db:generate
```

Apply database migrations:

```bash
pnpm db:migrate
```

Seed local development data:

```bash
pnpm db:seed
```

---

## 🔑 Environment Variables

The root [.env.example](.env.example) file is the single source of truth for environment configuration. The backend reads environment variables from `.env` in `apps/backend/.env`.

Backend configuration (`apps/backend/.env`):

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ebms?schema=public"
JWT_ACCESS_SECRET="replace-with-a-secure-access-secret"
JWT_REFRESH_SECRET="replace-with-a-secure-refresh-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
BCRYPT_SALT_ROUNDS=10
```

Frontend configuration (defaults to `/api/v1` via Vite dev proxy):

```env
VITE_API_BASE_URL="http://localhost:3000/api/v1"
```

---

## 🏃 Running the Application

Run the backend API:

```bash
pnpm dev:backend
```

Backend URL: `http://localhost:3000`  
Health check: `http://localhost:3000/api/v1/health`

Run the frontend application:

```bash
pnpm dev:frontend
```

Frontend URL: `http://localhost:5173`

---

## 🧪 Build and Quality Checks

Run all workspace builds:
```bash
pnpm build
```

Run TypeScript checks:
```bash
pnpm typecheck
```

Run ESLint:
```bash
pnpm lint
```

Run backend tests:
```bash
pnpm test
```

Check formatting:
```bash
pnpm format:check
```

---

## 📡 API Overview

Base URL: `/api/v1`

### Health
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Server liveness check |

### Authentication
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Login and receive tokens |
| POST | `/auth/refresh` | Refresh authentication tokens |
| GET | `/auth/me` | Get current authenticated user |
| POST | `/auth/logout` | Logout |

### Customers
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/customers` | List customers |
| GET | `/customers/:id` | Get customer by ID |
| POST | `/customers` | Create customer |
| PUT | `/customers/:id` | Update customer |
| DELETE | `/customers/:id` | Archive customer |

### Designs
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/designs` | List designs |
| GET | `/designs/:id` | Get design by ID |
| POST | `/designs` | Create design |
| PUT | `/designs/:id` | Update design |
| DELETE | `/designs/:id` | Archive design |

### Jobs
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/jobs` | List jobs |
| GET | `/jobs/:id` | Get job by ID |
| POST | `/jobs` | Create job |
| PUT | `/jobs/:id` | Update job |
| DELETE | `/jobs/:id` | Archive job |

*(Note: `/orders` is exposed as an alias for job routes).*

### Production
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/production` | List production queue |
| POST | `/production/assign` | Assign operator |
| POST | `/production/start` | Start production |
| POST | `/production/complete` | Complete production |
| POST | `/production/quality-check` | Record quality check |
| POST | `/production/deliver` | Mark job as delivered |

### Invoices
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/invoices` | List invoices |
| GET | `/invoices/:id` | Get invoice by ID |
| POST | `/invoices` | Create invoice |
| PUT | `/invoices/:id` | Update invoice |
| POST | `/invoices/:id/cancel` | Cancel invoice |

### Payments
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/payments` | List payments |
| GET | `/payments/:id` | Get payment by ID |
| POST | `/payments` | Create payment |

### Dashboard & Reports
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/dashboard/summary` | Get dashboard summary metrics |
| GET | `/reports/customers` | Customer report |
| GET | `/reports/jobs` | Job report |
| GET | `/reports/production` | Production report |
| GET | `/reports/invoices` | Invoice report |
| GET | `/reports/payments` | Payment report |
| GET | `/reports/revenue` | Revenue report |

---

## 📚 Documentation Links

- [Project Context](docs/PROJECT_CONTEXT.md)
- [AI Engineering Guide](docs/AI_ENGINEERING_GUIDE.md)
- [Master Context](docs/developer-kit/00_MASTER_CONTEXT.md)
- [System Architecture](docs/developer-kit/04_SYSTEM_ARCHITECTURE.md)
- [Logical Data Model](docs/developer-kit/05_LOGICAL_DATA_MODEL.md)
- [Database Design](docs/developer-kit/06_DATABASE_DESIGN.md)
- [API Specification](docs/developer-kit/07_API_SPECIFICATION.md)
- [UI Specification](docs/developer-kit/08_UI_SPECIFICATION.md)
- [Coding Standards](docs/developer-kit/09_CODING_STANDARDS.md)
- [ADR Index](docs/developer-kit/13_ADR_INDEX.md)

---

## 🗺️ Future Roadmap

- Deployment documentation & Docker Compose setup
- CI/CD workflow automation (GitHub Actions)
- PDF invoice generation engine
- WhatsApp / SMS notification integrations
- Machine thread & garment inventory management

---

## 📄 License

This project is released under the [MIT License](LICENSE).

---

## 👤 Author

**Meet Chauhan**
- GitHub: [@https-meet](https://github.com/https-meet)

