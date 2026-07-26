# 06_DATABASE_DESIGN.md

**Project:** Embroidery Business Management System (EBMS)

**Developer Kit Version:** 1.0

**Document Version:** 1.0

**Status:** Approved

---

# 1. Purpose

This document defines the physical database design for the Embroidery Business Management System (EBMS).

It translates the Logical Data Model into a relational schema suitable for implementation using PostgreSQL and Prisma ORM.

The objectives of the database design are:

* Preserve business integrity.
* Ensure long-term maintainability.
* Support efficient querying.
* Enable future expansion.
* Minimize data duplication while preserving historical accuracy.

---

# 2. Database Design Principles

The database follows these principles.

## DB-001 Data Integrity First

Business correctness is always more important than storage efficiency.

---

## DB-002 Normalize Operational Data

Operational entities should generally conform to Third Normal Form (3NF) to reduce duplication and maintain consistency.

Intentional denormalization is permitted only when it provides clear business value (for example, historical invoice snapshots or reporting optimizations).

---

## DB-003 Immutable Financial Records

Financial records become immutable after confirmation.

Updates should occur through new business transactions rather than modifying historical data.

---

## DB-004 Explicit Relationships

Every relationship between entities must be explicitly represented.

No implicit references.

---

## DB-005 UUID Primary Keys

Every major entity uses a UUID as its primary identifier.

Human-readable business identifiers remain separate.

Example:

Customer

```text
ID

↓

550e8400-e29b-41d4-a716-446655440000
```

Business Code

```text
CUS-000145
```

---

## DB-006 Business Codes Are Not Primary Keys

Business identifiers may change due to formatting or numbering policies.

Primary keys must remain stable.

---

## DB-007 Archive Strategy

Operational entities support archival rather than permanent deletion.

The user-facing action is called "Archive". Internally, archival is implemented via a `deleted_at` timestamp column.

Financial records are never archived. They use status transitions.

Historical business records remain permanently accessible for audit and reporting.

---

## DB-008 Auditability

Database design must support auditing of important business events.

---

# 3. Database Technology

| Component          | Technology     |
| ------------------ | -------------- |
| Database Engine    | PostgreSQL     |
| ORM                | Prisma         |
| Migration Tool     | Prisma Migrate |
| Identifier         | UUID           |
| Time Zone          | UTC            |
| Character Encoding | UTF-8          |

---

# 4. Core Tables

The first version of EBMS consists of the following primary tables.

## Master Data

* customers
* designs
* settings

---

## Operational Data

* jobs
* job_items
* attachments

---

## Financial Data

* invoices
* invoice_items
* payments
* payment_allocations

---

## Security

* users
* roles (future)
* permissions (future)

---

## Audit

* audit_logs

---

# 5. Table Ownership

| Table               | Business Owner     |
| ------------------- | ------------------ |
| customers           | Customer Aggregate |
| jobs                | Job Aggregate      |
| job_items           | Job Aggregate      |
| designs             | Design Aggregate   |
| invoices            | Invoice Aggregate  |
| invoice_items       | Invoice Aggregate  |
| payments            | Payment Aggregate  |
| payment_allocations | Payment Aggregate  |
| attachments         | Supporting Entity  |
| settings            | Settings Aggregate |
| audit_logs          | Infrastructure     |

---

# 6. Key Design Decisions

## Customer Codes

Customers have two identifiers.

System Identifier

```text
UUID
```

Business Identifier

```text
CUS-000001
```

---

## Job Numbers

Jobs receive sequential business numbers that reset annually.

Format: JOB-{YYYY}-{NNNNNN}

* YYYY — 4-digit year of Job creation.
* NNNNNN — 6-digit zero-padded sequential counter, resets to 000001 on January 1st each year.
* Job Numbers are unique within a calendar year and must never be reused.

Example:

```text
JOB-2026-000123
```

The counter is managed at the application layer using a dedicated sequence table or PostgreSQL sequence per entity type per year.

---

## Invoice Numbers

Invoices use business numbering that resets annually, independent of their UUID.

Format: INV-{YYYY}-{NNNNNN}

* YYYY — 4-digit year of Invoice creation.
* NNNNNN — 6-digit zero-padded sequential counter, resets to 000001 on January 1st each year.
* Invoice Numbers are unique within a calendar year.
* A cancelled Invoice Number is retired and must not be reused within the same year.

Example:

```text
INV-2026-000456
```

---

## Payment Numbers

Payments receive business identifiers that reset annually.

Format: PAY-{YYYY}-{NNNNNN}

* YYYY — 4-digit year of Payment creation.
* NNNNNN — 6-digit zero-padded sequential counter, resets to 000001 on January 1st each year.
* Payment Numbers are unique within a calendar year and must never be reused.

Example:

```text
PAY-2026-000082
```

---

# 7. Relationship Strategy

The database implements the relationships defined in the Logical Data Model.

Key relationships include:

* Customer → Jobs
* Customer → Invoices
* Customer → Payments
* Job → Job Items
* Job Item → Design
* Invoice → Invoice Items
* Payment → Payment Allocations
* Payment Allocation → Invoice

Referential integrity is enforced using foreign key constraints.

---

# 8. Snapshot Strategy

Certain records intentionally duplicate business information to preserve history.

Invoice Items store a snapshot of:

* Description
* Quantity
* Unit Price
* Tax (if applicable)
* Total

Future changes to Job Items or Designs must not alter issued invoices.

---

# 9. Archive Strategy

Three categories of record lifecycle govern how data is managed:

## Category 1 — Operational Records (Archive via `deleted_at`)

The following tables include a `deleted_at TIMESTAMP NULL` column:

| Table | Archive Method |
| ----- | -------------- |
| customers | deleted_at |
| designs | deleted_at |
| jobs | deleted_at |
| job_items | deleted_at |
| attachments | deleted_at |

Archiving sets `deleted_at` to the current timestamp.

All standard queries must include `WHERE deleted_at IS NULL`.

User-facing action is called "Archive". The term "Delete" must not appear in UI or user-facing documentation for these entities.

## Category 2 — Financial Records (Status transitions only, never archived or deleted)

The following tables do not have a `deleted_at` column:

| Table | Status Values |
| ----- | ------------- |
| invoices | DRAFT, ISSUED, PARTIALLY_PAID, PAID, CANCELLED |
| invoice_items | Immutable after Invoice issuance |
| payments | DRAFT, CONFIRMED |
| payment_allocations | Immutable after Payment confirmation |

A CANCELLED invoice retains all data permanently with status CANCELLED.

The cancelled invoice number is retired and must not be reused within the same calendar year.

## Category 3 — System Records (Never deleted)

| Table | Policy |
| ----- | ------ |
| audit_logs | Append-only, never deleted |
| settings | Updated in-place, never deleted |

User records are managed via an `is_active` boolean column rather than `deleted_at`, since user deactivation has distinct business semantics from archival.

---

# 10. Indexing Strategy

Indexes should support the most common business queries.

Examples include:

* Business codes (Customer, Job, Invoice, Payment)
* Customer name
* Job status
* Invoice status
* Payment date
* Creation timestamp
* Foreign key columns

Composite indexes should be added only after measuring query performance.

---

# 11. Constraints

The database should enforce structural rules where appropriate, such as:

* Required relationships
* Unique business codes
* Positive monetary amounts
* Valid status values
* Referential integrity

Complex business rules remain the responsibility of the application layer.

---

# 12. Transactions

Business operations spanning multiple tables must execute within database transactions.

Examples include:

* Issue Invoice
* Record Payment
* Confirm Payment

If any step fails, the entire transaction must be rolled back.

---

# 12A. Payment Methods

The `payments` table stores payment method using an enum.

Approved values for Version 1:

| Value | Description |
| ----- | ----------- |
| CASH | Physical currency payment |
| UPI | Unified Payments Interface digital payment |
| BANK_TRANSFER | Direct bank-to-bank transfer (NEFT / RTGS / IMPS) |
| CHEQUE | Written order to pay from a bank account |

Implemented as a Prisma enum or PostgreSQL enum type.

No other values are valid in Version 1.

---

# 12B. Invoice Discount Data Model

The `invoices` table stores optional discount information using three columns:

| Column | Type | Description |
| ------ | ---- | ----------- |
| `discount_type` | `ENUM('PERCENTAGE', 'FIXED') NULL` | Type of discount |
| `discount_value` | `DECIMAL(10, 4) NULL` | Percentage (0–100) or fixed amount entered |
| `discount_amount` | `DECIMAL(10, 2) NULL` | Calculated monetary reduction, frozen at issuance |

Calculation rules (applied by the backend at issuance):

* PERCENTAGE: `discount_amount = ROUND(subtotal × discount_value / 100, 2)`
* FIXED: `discount_amount = discount_value` (must not exceed subtotal)

Invariants:

* All three columns must be NULL together or populated together.
* `Grand Total = Subtotal − discount_amount`
* Grand Total must always be greater than zero.
* `discount_amount` is set at invoice issuance and never recalculated.

See ADR-016 for full rationale.

---

# 13. Time Management

Every major table should include consistent timestamp fields:

* Created At
* Updated At
* Archived At (where applicable)

All timestamps are stored in UTC.

---

# 14. Future Expansion

The schema should accommodate future modules without significant redesign.

Potential additions include:

* Inventory
* Suppliers
* Purchase Orders
* Production Machines
* Employee Management
* Barcode Tracking
* QR Code Tracking

---

# 15. Transition to Implementation

This document defines the overall physical database strategy and design principles.

The Prisma schema is implemented incrementally, module by module, aligned with the development plan.

| Phase | Module | Tables Introduced |
| ----- | ------ | ----------------- |
| Phase 1 | Authentication | users, audit_logs |
| Phase 2 | Customer | customers |
| Phase 3 | Design | designs, attachments |
| Phase 4 | Job | jobs, job_items |
| Phase 5 | Invoice | invoices, invoice_items |
| Phase 6 | Payment | payments, payment_allocations |

Each module's Prisma schema is reviewed and approved before implementation of that module begins.

All schema changes must use Prisma Migrate. Manual schema edits in production are prohibited.

All implementation details (column types, constraints, indexes, migration scripts) must remain consistent with the principles defined in this document.

---

# End of Document
