# Embroidery Business Management System (EBMS)

EBMS is a full-stack business management application for embroidery businesses. It helps teams manage the complete operational workflow: customers, embroidery designs, jobs, production progress, invoices, payments, reports, and business settings.

The project is built as a TypeScript pnpm workspace with a React frontend, an Express API, Prisma ORM, and PostgreSQL. It is organized around business features rather than generic technical layers, making the system easier to understand, extend, and maintain.

## Highlights

- Full-stack TypeScript application with React, Express, Prisma, and PostgreSQL
- Feature-based frontend and modular backend organization
- JWT authentication with role-based authorization
- End-to-end embroidery workflow from customer intake to payment reporting
- Production-ready workspace scripts for build, type checking, linting, testing, and formatting

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Business Workflow](#business-workflow)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Build and Quality Checks](#build-and-quality-checks)
- [Screenshots](#screenshots)
- [API Overview](#api-overview)
- [Documentation Links](#documentation-links)
- [Future Roadmap](#future-roadmap)
- [License](#license)
- [Author](#author)

## Project Overview

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

## Key Features

### Authentication and Authorization

- User registration and login
- JWT access and refresh token flow
- Protected frontend routes
- Protected backend API routes
- Role-based access control for `ADMIN`, `MANAGER`, and `OPERATOR`

### Customers

- Create, view, update, list, search, and archive customers
- Customer codes
- Customer type support for individuals and companies
- Pagination and filtering support

### Designs

- Create, view, update, list, search, and archive embroidery designs
- Design codes
- Category filtering
- Design metadata such as stitch count, dimensions, color count, preview URL, and file URL

### Jobs

- Create, view, update, list, and archive jobs
- Multiple job items per job
- Customer and design associations
- Job priority and lifecycle status
- Automatic line-total handling through the business workflow

### Production

- Production queue
- Operator assignment
- Start production
- Complete production
- Quality check
- Delivery status transition

### Invoices

- Create, view, update, list, and cancel invoices
- Invoice items
- Invoice status lifecycle
- Discounts by percentage or fixed amount
- Subtotal, grand total, paid amount, and outstanding balance tracking

### Payments

- Create, view, and list payments
- Payment methods: cash, UPI, bank transfer, and cheque
- Payment allocations to invoices
- Partial and full payment support
- Automatic invoice balance updates

### Dashboard and Reports

- Dashboard summary metrics
- Customer reports
- Job reports
- Production reports
- Invoice reports
- Payment reports
- Revenue reports

### Settings

- Business profile preferences
- Invoice notes and bank details
- Local frontend persistence for application preferences

## Business Workflow

EBMS follows the real operational flow of an embroidery business:

```text
Customer
  -> Design
  -> Job
  -> Job Items
  -> Production Queue
  -> Production Completion
  -> Invoice
  -> Payment
  -> Dashboard and Reports
```

The workflow keeps customer, production, and financial information connected so users can track work from the first customer interaction through final payment.

## Architecture Overview

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

The frontend is organized by feature under `apps/frontend/src/features`.

Each feature typically owns:

- `api`
- `components`
- `hooks`
- `pages`
- `schemas`
- `types`

Shared frontend code lives under `apps/frontend/src/shared`, including reusable UI components, hooks, constants, API utilities, query configuration, providers, and formatting helpers.

Routing is centralized in `apps/frontend/src/routes/AppRoutes.tsx` and uses route-level lazy loading with `React.lazy()` and `Suspense`.

### Backend Architecture

The backend is organized by business module under `apps/backend/src/modules`.

Each module follows a consistent structure:

- `router`
- `controller`
- `service`
- `repository`
- `schema`
- `types`
- `__tests__` where applicable

The backend exposes a versioned REST API under `/api/v1`, validates requests with Zod, applies authentication and role checks through middleware, and persists data through Prisma and PostgreSQL.

## Tech Stack

### Frontend

- React 19
- Vite
- TypeScript
- React Router
- TanStack Query
- Axios
- React Hook Form
- Zod
- Tailwind CSS
- Sonner
- Lucide React

### Backend

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- Zod
- JSON Web Tokens
- bcryptjs
- Vitest
- Supertest

### Workspace and Tooling

- pnpm workspaces
- ESLint flat config
- Prettier
- Shared TypeScript configuration

## Repository Structure

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

## Installation

### Prerequisites

- Node.js 20 or newer
- pnpm 9 or newer
- PostgreSQL

### Install Dependencies

From the repository root:

```bash
pnpm install
```

### Database Setup

Create a PostgreSQL database for the application.

Example:

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

## Environment Variables

The root [.env.example](.env.example) file is the single source of truth for environment configuration.

The backend reads environment variables from `.env` in the backend package working directory.

Create:

```text
apps/backend/.env
```

Backend variables:

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

The frontend defaults to `/api/v1`, which works with the Vite development proxy in `apps/frontend/vite.config.ts`.

For deployments or custom API hosts, configure:

```env
VITE_API_BASE_URL="http://localhost:3000/api/v1"
```

## Running the Application

Run the backend API:

```bash
pnpm dev:backend
```

Backend URL:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/v1/health
```

Run the frontend application:

```bash
pnpm dev:frontend
```

Frontend URL:

```text
http://localhost:5173
```

## Build and Quality Checks

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

## Screenshots

### Login

### Dashboard

### Customers

### Designs

### Jobs

### Production

### Invoices

### Payments

### Reports

### Settings

## API Overview

Base URL:

```text
/api/v1
```

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

The backend also exposes `/orders` as an alias for job routes.

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

### Dashboard

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/dashboard/summary` | Get dashboard summary metrics |

### Reports

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/reports/customers` | Customer report |
| GET | `/reports/jobs` | Job report |
| GET | `/reports/production` | Production report |
| GET | `/reports/invoices` | Invoice report |
| GET | `/reports/payments` | Payment report |
| GET | `/reports/revenue` | Revenue report |

## Documentation Links

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

## Future Roadmap

The completed v1 application focuses on the core business workflow. Future improvements may include:

- Deployment documentation
- CI/CD workflow automation
- Seed data for demos and local testing
- Public API collection or OpenAPI documentation
- Frontend automated tests
- File upload storage for design and job attachments
- PDF invoice generation
- Notification integrations
- Inventory support
- Audit log views

## License

This project is released under the [MIT License](LICENSE).

## Author

Meet Chauhan

- GitHub: [https-meet](https://github.com/https-meet)
