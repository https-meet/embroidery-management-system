# 12_CHANGELOG.md

**Project:** Embroidery Business Management System (EBMS)

**Document Type:** Developer Kit Changelog

---

# Purpose

This document records every change made to the EBMS Developer Kit.

Each entry records:

* The Developer Kit version
* The date the change was approved
* The documents affected
* A summary of what changed and why

---

# Versioning Policy

## When to increment the Developer Kit version

| Change Type | Version Action |
| ----------- | -------------- |
| New business rules or rule corrections | Increment |
| New architectural decisions (new ADR) | Increment |
| New feature specifications | Increment |
| Changes to API contracts (endpoint paths, error codes, response shapes) | Increment |
| Changes to database schema design policies | Increment |
| Clarifications or corrections to existing content | Increment |
| Typographical or formatting corrections only | No increment required |

## Format

`MAJOR.MINOR`

* **MINOR** — clarifications, additions, non-breaking corrections.
* **MAJOR** — breaking changes (API contract changes, entity renames, structural redesigns).

---

# Changelog

---

## Developer Kit v1.0 — July 2026

**Status:** Approved

**Summary:** Initial approved baseline for the Embroidery Business Management System Developer Kit.

This version freezes all business rules, architectural decisions, data models, API specifications, feature specifications, and development standards required to begin implementation.

---

### New Documents

| Document | Purpose |
| -------- | ------- |
| 12_CHANGELOG.md | This document — tracks all future Developer Kit changes |
| 13_ADR_INDEX.md | Architecture Decision Record index — 16 approved ADRs |

---

### Approved Decisions Applied

The following decisions were resolved, approved, and applied across all affected documents in this version.

---

#### Decision 1 — Canonical API Error Response Format

**Affected Documents:** 04_SYSTEM_ARCHITECTURE.md, 07_API_SPECIFICATION.md, 09_CODING_STANDARDS.md

**Change:**

Two distinct error response shapes are now canonical:

**Business / Domain Errors** (single named failure):

```json
{
  "success": false,
  "error": {
    "code": "INVOICE_ALREADY_ISSUED",
    "message": "This invoice has already been issued and cannot be edited."
  }
}
```

**Validation Errors** (multiple simultaneous field failures):

```json
{
  "success": false,
  "errors": [
    { "field": "customerName", "message": "Customer name is required." }
  ]
}
```

Error codes use `SCREAMING_SNAKE_CASE` and are part of the public API contract.

**Rationale:** The previous documentation showed only the business error format but the system also requires inline validation error reporting. The two shapes serve distinct UI purposes.

---

#### Decision 2 — Infrastructure: Supabase PostgreSQL + Supabase Storage

**Affected Documents:** 00_MASTER_CONTEXT.md, 04_SYSTEM_ARCHITECTURE.md (Sections 26, 31, 33)

**Change:**

* **Database:** PostgreSQL hosted on Supabase (Pro tier in production for PITR and automated backups).
* **File Storage:** Supabase Storage (S3-compatible cloud object storage). Local filesystem storage is no longer in scope.
* **Backup Policy:** Expanded to include Backup Verification procedures and Recovery/Restore procedures.

**Rationale:** Local filesystem storage is incompatible with "data loss is unacceptable" on modern cloud deployment platforms. Supabase Storage is S3-compatible and can be replaced by implementing a new FileStorageService adapter.

---

#### Decision 3 — FileStorageService Abstraction (ADR-015)

**Affected Documents:** 04_SYSTEM_ARCHITECTURE.md (Section 26), 09_CODING_STANDARDS.md, 00_MASTER_CONTEXT.md

**Change:**

All file storage operations must go through a `FileStorageService` interface. The application must never import or call storage provider SDKs directly.

Version 1 implementation: `SupabaseFileStorageService`

**Rationale:** Prevents vendor lock-in. Enables future storage provider migration without changing business logic.

---

#### Decision 4 — Archive Terminology

**Affected Documents:** 02_BUSINESS_RULES.md, 04A_DOMAIN_MODEL.md, 04B_UBIQUITOUS_LANGUAGE.md, 06_DATABASE_DESIGN.md, all Feature Specifications

**Change:**

The user-facing business action for removing operational records is now uniformly called **"Archive"**.

* "Delete" must not appear in user-facing UI or documentation for business records.
* Internally, archival is implemented via `deleted_at TIMESTAMP NULL`.
* Financial records are never archived — they use status transitions only.

Three record lifecycle categories are now formally documented in BR-802, DB-009, and ADR-003.

**Rationale:** "Delete" implies permanent loss. "Archive" correctly communicates that the record is preserved for historical and audit access.

---

#### Decision 5 — Invoice Draft/Issue/Cancel Workflow

**Affected Documents:** 02_BUSINESS_RULES.md, 07_API_SPECIFICATION.md, 03_FEATURE_SPECIFICATIONS/07_INVOICES.md

**Change:**

Invoice API now has a full two-step draft/issue workflow:

* `POST /invoices` — creates a Draft Invoice
* `PUT /invoices/{id}` — updates a Draft Invoice
* `POST /invoices/{id}/issue` — issues the Invoice (locks it)
* `POST /invoices/{id}/cancel` — cancels a Draft Invoice only

CANCELLED is a final state. A cancelled invoice number is retired and must never be reused within the same calendar year.

Issued, Partially Paid, and Paid invoices cannot be cancelled in Version 1.

**Rationale:** Resolves contradiction between the previous API spec (which showed `POST /invoices` as "Issue Invoice") and the business rules requiring a draft-then-issue workflow.

---

#### Decision 6 — Invoice Discount Data Model (ADR-016)

**Affected Documents:** 02_BUSINESS_RULES.md (BR-407), 04A_DOMAIN_MODEL.md, 04B_UBIQUITOUS_LANGUAGE.md, 05_LOGICAL_DATA_MODEL.md, 06_DATABASE_DESIGN.md (Section 12B), 03_FEATURE_SPECIFICATIONS/07_INVOICES.md

**Change:**

Invoice discounts use three dedicated columns:

| Column | Type |
| ------ | ---- |
| `discount_type` | `ENUM('PERCENTAGE', 'FIXED') NULL` |
| `discount_value` | `DECIMAL(10, 4) NULL` |
| `discount_amount` | `DECIMAL(10, 2) NULL` |

`discount_amount` is calculated at issuance and frozen permanently. It is never recalculated.

Grand Total = Subtotal − `discount_amount`. Grand Total must always be greater than zero.

**Rationale:** Storing the computed amount preserves the Invoice financial snapshot consistent with ADR-004.

---

#### Decision 7 — Payment Methods Enum

**Affected Documents:** 02_BUSINESS_RULES.md (BR-507), 04B_UBIQUITOUS_LANGUAGE.md, 06_DATABASE_DESIGN.md (Section 12A), 03_FEATURE_SPECIFICATIONS/08_PAYMENTS.md

**Change:**

Version 1 supports exactly four Payment Methods: Cash, UPI, Bank Transfer, Cheque.

Payment Method is mandatory for every Payment record.

**Rationale:** Prevents unmapped or inconsistent payment method values in the database.

---

#### Decision 8 — Yearly Business Number Reset

**Affected Documents:** 02_BUSINESS_RULES.md (BR-103, BR-404, BR-506), 06_DATABASE_DESIGN.md (Section 6)

**Change:**

All business number counters (Job, Invoice, Payment) reset to 000001 on January 1st of each calendar year.

Format: `{PREFIX}-{YYYY}-{NNNNNN}`

**Rationale:** Aligns with common accounting practice. Makes year of record immediately visible without checking timestamps.

---

#### Decision 9 — JWT Refresh Tokens (ADR-013)

**Affected Documents:** 00_MASTER_CONTEXT.md, 04_SYSTEM_ARCHITECTURE.md (Section 16), 07_API_SPECIFICATION.md (Section 3), 11_DEVELOPMENT_PLAN.md (Phase 1)

**Change:**

Refresh Tokens are in-scope for Version 1. Authentication now includes:

* `POST /api/v1/auth/login` — returns access + refresh token
* `POST /api/v1/auth/refresh` — rotates the refresh token and returns new access token
* `POST /api/v1/auth/logout` — invalidates the refresh token

**Rationale:** Short-lived access tokens alone require users to re-authenticate frequently. Refresh tokens provide seamless session continuity without compromising security.

---

#### Decision 10 — Payment Attachments Exclusion

**Affected Documents:** 02_BUSINESS_RULES.md (BR-601), 05_LOGICAL_DATA_MODEL.md (Section on Attachment Relationships)

**Change:**

Payments do not support attachments in Version 1. The `attachments` table supports: Customer, Job, Job Item, Invoice only.

Design files are managed separately through the Design aggregate and are not generic Attachments.

**Rationale:** Resolves a contradiction between the feature spec and the original Business Rules document.

---

#### Decision 11 — pnpm Workspace Monorepo + Vertical Slice Development

**Affected Documents:** 00_MASTER_CONTEXT.md, 04_SYSTEM_ARCHITECTURE.md, 09_CODING_STANDARDS.md (Section 4), 10_AI_DEVELOPMENT_GUIDE.md, 11_DEVELOPMENT_PLAN.md

**Change:**

Repository structure formally documented as a pnpm workspace monorepo with four packages:

* `apps/backend` — Node.js / Express / Prisma API
* `apps/frontend` — React / Vite SPA
* `packages/shared` — Shared TypeScript types, DTOs, constants (no business logic)
* `packages/config` — Shared ESLint, Prettier, TypeScript configurations

Development approach is Vertical Slice: each module delivers Backend + Frontend + Tests as a single complete increment.

**Rationale:** Frontend and backend share TypeScript types via `packages/shared`, eliminating type drift. Vertical slices deliver demonstrable business value at each phase.

---

#### Decision 12 — ADR Index (ADR Governance)

**Affected Documents:** 00_MASTER_CONTEXT.md, 10_AI_DEVELOPMENT_GUIDE.md; new document 13_ADR_INDEX.md created.

**Change:**

Formal Architecture Decision Record index established with 16 approved ADRs covering all major architectural decisions made to date.

AI and human developers must consult 13_ADR_INDEX.md before making any architectural decision. New decisions must be recorded as ADRs before implementation begins.

**Rationale:** Prevents silent architectural drift. Ensures all decisions are traceable and reversible through formal governance.

---

# End of Document
