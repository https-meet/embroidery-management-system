# 13_ADR_INDEX.md

**Project:** Embroidery Business Management System (EBMS)

**Developer Kit Version:** 1.0

**Document Version:** 1.0

**Status:** Approved

**Document Type:** Architecture Decision Record Index

---

# 1. Purpose

This document is the official index of all Architecture Decision Records (ADRs) for EBMS.

An ADR records an important architectural decision, its context, the rationale for choosing it, and its consequences.

All ADRs are considered binding unless formally superseded by a newer ADR.

---

# 2. ADR Governance

## Making New Decisions

New architectural decisions must:

1. Be recorded as a new ADR in this document.
2. Reference the affected documentation sections.
3. Receive owner approval.
4. Trigger a Developer Kit version increment.

## Superseding Decisions

Superseded ADRs are marked with status SUPERSEDED and include a reference to the replacement ADR.

Silent modification of historical decisions is not permitted.

## Conflict Resolution

If an implementation requirement appears to conflict with an existing ADR, implementation must stop and the conflict must be escalated for owner review before proceeding.

---

# 3. ADR Registry

---

## ADR-001 — Modular Monolith Architecture

| Field | Value |
| ----- | ----- |
| Status | Approved |
| Developer Kit Version | 1.0 |
| Reference | 04_SYSTEM_ARCHITECTURE.md — Section 7 |

**Decision:**

EBMS is implemented as a Modular Monolith rather than Microservices or a traditional Layered Monolith.

**Rationale:**

* Simple deployment — single deployable unit.
* Clear module ownership without the operational complexity of distributed systems.
* Low infrastructure overhead appropriate for a small business application.
* Straightforward debugging and testing.
* Allows future extraction of individual modules into separate services if business growth justifies it.

**Consequences:**

* Single deployable unit with a shared database.
* Module boundaries are enforced by architectural constraints, not network boundaries.
* Direct access between module internals is prohibited.

---

## ADR-002 — UUID Primary Keys

| Field | Value |
| ----- | ----- |
| Status | Approved |
| Developer Kit Version | 1.0 |
| Reference | 06_DATABASE_DESIGN.md — Section 5; 02_BUSINESS_RULES.md — BR-804 |

**Decision:**

Every database entity uses a UUID as its internal primary identifier. Business-friendly codes (CUS-000001, JOB-2026-000001) are stored as separate fields and must not be used as primary keys.

**Rationale:**

* Globally unique — safe for future distributed or multi-tenant scenarios.
* Harder to enumerate than sequential integers, reducing information exposure.
* Primary keys remain stable even if business code formats change.

**Consequences:**

* Slightly larger indexes than integer keys.
* Business codes and internal UUIDs always coexist as separate columns.

---

## ADR-003 — Archive Strategy

| Field | Value |
| ----- | ----- |
| Status | Approved |
| Developer Kit Version | 1.0 |
| Reference | 06_DATABASE_DESIGN.md — Section 9; 02_BUSINESS_RULES.md — BR-802, BR-803 |

**Decision:**

Business records are archived, not permanently deleted. Three categories govern lifecycle:

**Category 1 — Operational Records (Archive via `deleted_at`):**

* customers, designs, jobs, job_items, attachments
* Uses a `deleted_at TIMESTAMP NULL` column.
* User-facing action is called "Archive" throughout UI and documentation.
* Archived records are excluded from standard queries but preserved for historical reports.

**Category 2 — Financial Records (Status transitions only, never deleted):**

* invoices, invoice_items, payments, payment_allocations
* Status columns govern the lifecycle.
* Draft invoices transition to CANCELLED — they are not deleted.
* Issued invoices and confirmed payments are immutable.

**Category 3 — System Records (Never deleted):**

* audit_logs, settings

**Rationale:**

* Business data must never be permanently lost.
* Financial records require an immutable audit trail.
* "Archive" is the correct business term. "Delete" implies permanent loss and must not appear in user-facing documentation or UI for business records.

**Consequences:**

* All queries on operational tables must include `WHERE deleted_at IS NULL`.
* A cancelled invoice number is retired and must never be reused.
* The `deleted_at` column is an internal implementation detail; users see "Archived" as the status.

---

## ADR-004 — Invoice Snapshot Architecture

| Field | Value |
| ----- | ----- |
| Status | Approved |
| Developer Kit Version | 1.0 |
| Reference | 06_DATABASE_DESIGN.md — Section 8; 04A_DOMAIN_MODEL.md — Section 10 |

**Decision:**

When an Invoice is issued, Invoice Items copy the description, quantity, rate, and total from the source Job Items. These values are frozen at the moment of issuance and must never be changed thereafter, even if the underlying Job Items, Designs, or pricing subsequently change.

**Rationale:**

* Financial records must reflect what was actually billed at the time of billing.
* Historical invoices must be reproducible exactly for audit and dispute resolution.
* Prevents accidental financial record corruption caused by later operational changes.

**Consequences:**

* Intentional denormalization of pricing data into invoice_items.
* Invoice history is always accurate regardless of subsequent operational changes.
* Invoice Item editing is prohibited after the Invoice is issued.

---

## ADR-005 — Payment Allocation Model

| Field | Value |
| ----- | ----- |
| Status | Approved |
| Developer Kit Version | 1.0 |
| Reference | 05_LOGICAL_DATA_MODEL.md — Section 5; 04A_DOMAIN_MODEL.md — Section 12 |

**Decision:**

Payments are not directly linked to Invoices. A `PaymentAllocation` entity records how much of a given Payment is applied to each Invoice.

Business invariants:

* Total allocations must equal the Payment amount.
* A single allocation cannot exceed the Invoice's remaining balance.
* Invoice balance cannot become negative.

**Rationale:**

* Supports partial payments (one Invoice, multiple Payments over time).
* Supports consolidated payments (one Payment across multiple Invoices).
* Provides flexibility for future accounting integrations.

**Consequences:**

* Payment recording UI requires an allocation step.
* The payment_allocations table forms the many-to-many relationship between payments and invoices.

---

## ADR-006 — Role-Based Access Control (RBAC)

| Field | Value |
| ----- | ----- |
| Status | Approved |
| Developer Kit Version | 1.0 |
| Reference | 04_SYSTEM_ARCHITECTURE.md — Section 16 |

**Decision:**

Authorization uses Role-Based Access Control. Users are assigned Roles. Roles contain named Permission strings describing business capabilities.

Examples: `Customer.Create`, `Invoice.Issue`, `Payment.Confirm`, `Settings.Update`

**Rationale:**

* Permissions are descriptive and self-documenting.
* Easy to extend — new permissions can be added without changing the model.
* Supports future multi-user scenarios (employees, administrators, accountants).

**Consequences:**

* Every protected endpoint must enforce both authentication and authorization.
* The users table is implemented in Phase 1.
* Role and Permission tables may be simplified for Version 1 (single admin role) and extended in future versions.

---

## ADR-007 — Domain-Oriented Module Structure

| Field | Value |
| ----- | ----- |
| Status | Approved |
| Developer Kit Version | 1.0 |
| Reference | 04_SYSTEM_ARCHITECTURE.md — Section 10; 09_CODING_STANDARDS.md — Section 4 |

**Decision:**

Code is organized by business domain, not by technical layer. Each module contains its own controllers, services, repositories, validators, DTOs, routes, and tests.

```text
apps/backend/src/modules/
├── customers/
├── jobs/
├── designs/
├── invoices/
├── payments/
└── ...
```

**Rationale:**

* A developer working on invoices finds everything in one location.
* Modules can be extracted into separate services without major restructuring.
* Consistent structure reduces cognitive overhead for new contributors.

**Consequences:**

* There is no single shared `controllers/`, `services/`, or `repositories/` directory.
* Cross-module communication uses public module interfaces only.
* Module internals are not accessible from other modules.

---

## ADR-008 — pnpm Workspace Monorepo

| Field | Value |
| ----- | ----- |
| Status | Approved |
| Developer Kit Version | 1.0 |
| Reference | 09_CODING_STANDARDS.md — Section 4; 11_DEVELOPMENT_PLAN.md — Phase 0 |

**Decision:**

EBMS uses a pnpm workspace monorepo with the following structure:

```text
apps/
├── backend/    — Node.js / Express / Prisma API
└── frontend/   — React / Vite SPA

packages/
├── shared/     — Shared TypeScript types, DTOs, constants (no business logic)
└── config/     — Shared ESLint, Prettier, TypeScript base configurations
```

**Rationale:**

* Frontend and backend share TypeScript types via `packages/shared`, eliminating type drift.
* Shared configuration reduces maintenance overhead.
* pnpm workspaces provide efficient dependency resolution.
* Single repository simplifies the development workflow.

**Consequences:**

* pnpm is the required package manager.
* `packages/shared` must not contain business logic (Architecture Constraint AC-006).
* CI/CD must handle workspace-aware build steps.

---

## ADR-009 — Supabase PostgreSQL and Supabase Storage

| Field | Value |
| ----- | ----- |
| Status | Approved |
| Developer Kit Version | 1.0 |
| Reference | 04_SYSTEM_ARCHITECTURE.md — Sections 26 and 31; 00_MASTER_CONTEXT.md — Section 12 |

**Decision:**

* **Database:** PostgreSQL managed by Supabase (Free tier during development; Pro tier in production).
* **File Storage:** Supabase Storage (S3-compatible cloud object storage).

**Deployment targets:**

| Component | Development | Production |
| --------- | ----------- | ---------- |
| Database | Supabase Free | Supabase Pro ($25/month) |
| File Storage | Supabase Storage (Free, 1 GB) | Supabase Storage (Pro, 100 GB) |
| Backend | Local | Railway ($5/month) |
| Frontend | Local | Vercel (Free) |

**Rationale:**

* PostgreSQL is ACID-compliant and satisfies all financial data requirements.
* Supabase Pro provides PITR (7-day window) and automated daily backups.
* Application connects via a standard PostgreSQL connection string — no Supabase-specific code.
* Local filesystem storage is incompatible with "data loss is unacceptable" on modern cloud deployment platforms.
* Supabase Storage is S3-compatible — future migration requires only a new FileStorageService adapter.

**Consequences:**

* Application must never use Supabase-specific SDKs for database access. Prisma is the only database client.
* All file operations go through `FileStorageService` (see ADR-015).
* Supabase Pro must be activated before production launch.
* Monthly production cost: approximately ₹2,500/month ($30/month).

---

## ADR-010 — Incremental Prisma Schema Development

| Field | Value |
| ----- | ----- |
| Status | Approved |
| Developer Kit Version | 1.0 |
| Reference | 06_DATABASE_DESIGN.md — Section 15; 11_DEVELOPMENT_PLAN.md — Section 4 |

**Decision:**

The Prisma schema is not designed in its entirety before development begins. Instead, each module introduces its own Prisma models during its implementation phase, following the development plan sequence.

| Phase | Module | Tables Introduced |
| ----- | ------ | ----------------- |
| Phase 1 | Authentication | users |
| Phase 2 | Customer | customers |
| Phase 3 | Design | designs, attachments |
| Phase 4 | Job | jobs, job_items |
| Phase 5 | Invoice | invoices, invoice_items |
| Phase 6 | Payment | payments, payment_allocations |
| Phase 1 | Audit | audit_logs |

**Rationale:**

* Avoids designing a complete schema before business rules are validated in code.
* Smaller, focused migrations are easier to verify and rollback.
* Schema evolves alongside business understanding.

**Consequences:**

* Each phase must begin with a schema design step before any coding begins.
* All schema changes must use Prisma Migrate (no manual schema edits in production).
* Schema must remain consistent with the principles in `06_DATABASE_DESIGN.md` at every stage.

---

## ADR-011 — Yearly Business Number Reset

| Field | Value |
| ----- | ----- |
| Status | Approved |
| Developer Kit Version | 1.0 |
| Reference | 02_BUSINESS_RULES.md — BR-103, BR-404, BR-506; 06_DATABASE_DESIGN.md — Section 6 |

**Decision:**

Business-facing identifiers reset their sequential counter at the start of each calendar year.

Format: `{PREFIX}-{YYYY}-{NNNNNN}`

* `YYYY` — 4-digit year the record was created.
* `NNNNNN` — 6-digit zero-padded counter, resets to `000001` on January 1st each year.

Applies to: Job Numbers (`JOB-`), Invoice Numbers (`INV-`), Payment Numbers (`PAY-`), Customer Codes (`CUS-`).

**Rationale:**

* Aligns with business expectation of year-based numbering.
* Makes records immediately identifiable by year without checking timestamps.
* Consistent with common accounting and bookkeeping practice.

**Consequences:**

* A counter table or database sequence per entity type per year is required at the application layer.
* A number from 2026 (`JOB-2026-000999`) and a number from 2027 (`JOB-2027-000001`) are both valid and unique within their respective years.
* A retired number from a cancelled invoice must never be reused within the same year.

---

## ADR-012 — Dual API Error Response Format

| Field | Value |
| ----- | ----- |
| Status | Approved |
| Developer Kit Version | 1.0 |
| Reference | 07_API_SPECIFICATION.md — Section 4; 04_SYSTEM_ARCHITECTURE.md — Section 18 |

**Decision:**

Two distinct error response formats are used depending on error category:

**Business / Domain Errors:**

```json
{
  "success": false,
  "error": {
    "code": "INVOICE_ALREADY_ISSUED",
    "message": "This invoice has already been issued and cannot be edited."
  }
}
```

Used for: entity not found, business rule violations, invalid state transitions, authorization failures, conflicts.

**Validation Errors:**

```json
{
  "success": false,
  "errors": [
    { "field": "customerName", "message": "Customer name is required." },
    { "field": "paymentAmount", "message": "Payment amount must be greater than zero." }
  ]
}
```

Used for: missing required fields, invalid data types, format violations detected before business logic.

**Rationale:**

* Business errors represent a single named failure; validation errors represent multiple simultaneous field failures.
* The frontend handles each differently: toast notification for business errors, inline field messages for validation errors.

**Consequences:**

* All error codes use `SCREAMING_SNAKE_CASE` naming convention.
* Error codes are part of the public API contract and must not change without a version increment.
* Client applications must handle both error shapes.

---

## ADR-013 — JWT Refresh Token Authentication

| Field | Value |
| ----- | ----- |
| Status | Approved |
| Developer Kit Version | 1.0 |
| Reference | 04_SYSTEM_ARCHITECTURE.md — Section 16; 07_API_SPECIFICATION.md — Section 3; 11_DEVELOPMENT_PLAN.md — Phase 1 |

**Decision:**

Version 1 includes both JWT Access Tokens and Refresh Tokens.

Authentication stack:

* **Access Token:** Short-lived JWT used to authorize API requests.
* **Refresh Token:** Longer-lived token used to obtain new access tokens without requiring re-login.
* **bcrypt:** Used for password hashing.
* **RBAC:** Used for authorization (see ADR-006).

Authentication endpoints:

* `POST /api/v1/auth/login` — Returns access token + refresh token.
* `POST /api/v1/auth/refresh` — Returns new access token + rotated refresh token.
* `POST /api/v1/auth/logout` — Invalidates the refresh token.

**Rationale:**

* Short access token lifetime limits exposure if a token is compromised.
* Refresh tokens provide seamless session continuity for business users without requiring frequent re-login.
* Token rotation ensures a compromised refresh token cannot be reused after the legitimate user refreshes.

**Consequences:**

* Refresh tokens must be stored securely on the client (HttpOnly cookies recommended).
* The server must be able to invalidate refresh tokens (stored in the database or a cache).
* Token lifetimes are configurable via environment variables.

---

## ADR-014 — Vertical Slice Development

| Field | Value |
| ----- | ----- |
| Status | Approved |
| Developer Kit Version | 1.0 |
| Reference | 10_AI_DEVELOPMENT_GUIDE.md — Section 3; 11_DEVELOPMENT_PLAN.md — Section 4 |

**Decision:**

Each development phase delivers a complete vertical slice:

```text
Schema Design
     ↓
Backend Implementation
(routes → controller → service → repository → validator)
     ↓
Frontend Implementation
(page → components → hooks → API client)
     ↓
Tests
(unit → integration → API)
     ↓
Code Review
     ↓
Commit
```

No partial deliveries (backend-only or frontend-only) are considered complete.

**Rationale:**

* Delivers working, testable features incrementally.
* Each commit represents demonstrable end-to-end business value.
* Prevents incomplete states where the backend exists but the frontend cannot use it.

**Consequences:**

* Backend and frontend development for each module are interleaved, not sequential.
* Each phase is not complete until both backend and frontend are functional, tested, and reviewed.

---

## ADR-015 — FileStorageService Abstraction

| Field | Value |
| ----- | ----- |
| Status | Approved |
| Developer Kit Version | 1.0 |
| Reference | 04_SYSTEM_ARCHITECTURE.md — Section 26 |

**Decision:**

All file storage operations are performed through a `FileStorageService` interface. The application never depends directly on the Supabase Storage SDK, AWS SDK, or any other storage provider.

Version 1 implementation: `SupabaseFileStorageService`

Interface responsibilities:

* Upload file
* Download file
* Delete file
* Generate access URL

**Rationale:**

* Clean architecture — infrastructure details are hidden behind a business interface.
* Consistent with Architecture Constraint AC-002 (Domain Logic Must Not Depend on Frameworks).
* Storage provider can be replaced by implementing a new adapter, with no changes to business logic.

**Consequences:**

* `FileStorageService` interface must be defined before any file upload functionality is implemented (Phase 3).
* All file upload, download, and deletion operations must use this interface.
* Direct imports of storage provider SDKs in modules, services, or controllers are prohibited.

---

## ADR-016 — Invoice Discount Data Model

| Field | Value |
| ----- | ----- |
| Status | Approved |
| Developer Kit Version | 1.0 |
| Reference | 06_DATABASE_DESIGN.md — Section 12; 03_FEATURE_SPECIFICATIONS/07_INVOICES.md |

**Decision:**

Invoice discounts are stored using three database columns:

| Column | Type | Description |
| ------ | ---- | ----------- |
| `discount_type` | `ENUM('PERCENTAGE', 'FIXED') NULL` | The type of discount applied |
| `discount_value` | `DECIMAL(10, 4) NULL` | The percentage (0–100) or fixed monetary amount entered |
| `discount_amount` | `DECIMAL(10, 2) NULL` | The calculated monetary reduction, frozen at issuance |

Calculation rules:

* `PERCENTAGE`: `discount_amount = ROUND(subtotal × discount_value / 100, 2)`
* `FIXED`: `discount_amount = discount_value` (must not exceed subtotal)

Invariants:

* All three columns must be NULL together or populated together.
* Grand Total = Subtotal − `discount_amount`.
* Grand Total must always be greater than zero after discount.
* `discount_amount` is calculated at issuance and never recalculated thereafter.

**Rationale:**

* Storing the computed `discount_amount` preserves the financial snapshot (consistent with ADR-004).
* A historical invoice must always reflect the exact discount that was applied at the time of issuance, regardless of future pricing changes.

**Consequences:**

* The frontend must calculate a preview discount amount before issuance.
* The backend must validate and freeze the discount amount when issuing the invoice.

---

# 4. ADR Status Summary

| ADR | Title | Status |
| --- | ----- | ------ |
| ADR-001 | Modular Monolith Architecture | Approved |
| ADR-002 | UUID Primary Keys | Approved |
| ADR-003 | Archive Strategy | Approved |
| ADR-004 | Invoice Snapshot Architecture | Approved |
| ADR-005 | Payment Allocation Model | Approved |
| ADR-006 | Role-Based Access Control | Approved |
| ADR-007 | Domain-Oriented Module Structure | Approved |
| ADR-008 | pnpm Workspace Monorepo | Approved |
| ADR-009 | Supabase PostgreSQL and Supabase Storage | Approved |
| ADR-010 | Incremental Prisma Schema Development | Approved |
| ADR-011 | Yearly Business Number Reset | Approved |
| ADR-012 | Dual API Error Response Format | Approved |
| ADR-013 | JWT Refresh Token Authentication | Approved |
| ADR-014 | Vertical Slice Development | Approved |
| ADR-015 | FileStorageService Abstraction | Approved |
| ADR-016 | Invoice Discount Data Model | Approved |

---

# End of Document
