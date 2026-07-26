# 04A_DOMAIN_MODEL.md

**Project:** Embroidery Business Management System (EBMS)

**Developer Kit Version:** 1.0

**Document Version:** 1.0

**Status:** Approved

---

# 1. Purpose

The Domain Model defines the core business concepts of EBMS.

It answers questions such as:

* What are the business entities?
* Who owns what?
* Which entity is responsible for each business rule?
* Which objects may change together?
* Which relationships always exist?

This document describes the business model independently of:

* Database tables
* APIs
* UI
* Programming language

It represents the business itself.

---

# 2. Domain Philosophy

EBMS is designed using a business-first approach.

Every software component exists because it represents something meaningful in the embroidery business.

The domain model should remain stable even if:

* The database changes.
* The frontend changes.
* The backend framework changes.
* The deployment platform changes.

Business concepts outlive technology choices.

---

# 3. Core Business Domains

The system is divided into five primary business domains.

```text id="cq8a0r"
Customer Management

        │

        ▼

Production Management

        │

        ▼

Financial Management

        │

        ▼

Business Intelligence

        │

        ▼

System Administration
```

Each domain owns its own entities, rules, and responsibilities.

---

# 4. Aggregate Overview

EBMS is organized around Aggregate Roots.

Aggregate Roots control consistency within their boundaries.

```text id="2pjmka"
Customer
    │
    ├── Timeline
    └── Contacts (Future)

Job
    │
    └── Job Items

Invoice
    │
    └── Invoice Items

Payment
    │
    └── Payment Allocations

Design
    │
    └── Design Files

Settings
```

Child entities should never be modified without going through their Aggregate Root.

---

# 5. Customer Aggregate

## Purpose

Represents a business customer.

A customer is the owner of all business activity.

---

## Responsibilities

Owns:

* Customer Profile
* Customer Timeline
* Customer Financial Summary

Can:

* Create Jobs
* Receive Invoices
* Make Payments

Cannot:

* Exist without identification details.
* Be permanently removed through normal business operations.

---

## Business Invariants

A Customer:

* Must have a unique Customer Code.
* Must have a name.
* May have multiple Jobs.
* May have multiple Invoices.
* May have multiple Payments.
* May be archived.
* Must preserve historical relationships after archival.

---

# 6. Job Aggregate

## Purpose

Represents a production order received from a customer.

A Job groups one or more embroidery tasks.

---

## Responsibilities

Owns:

* Job Information
* Job Items
* Production Status

Coordinates:

* Design usage
* Production workflow

---

## Business Invariants

A Job:

* Belongs to exactly one Customer.
* Must contain at least one Job Item before production begins.
* Cannot be invoiced directly.
* Produces Invoice Items through completed Job Items.
* Cannot change after final archival.

---

# 7. Job Item Entity

## Purpose

Represents one embroidery operation inside a Job.

Example:

Front Logo

Back Logo

Sleeve Embroidery

Cap Embroidery

Each represents a separate Job Item.

---

## Responsibilities

Stores:

* Quantity
* Position
* Thread Colors
* Design
* Production Status
* Rate

---

## Business Invariants

A Job Item:

* Belongs to exactly one Job.
* References one Design.
* May appear on one Invoice Item.
* Cannot belong to multiple Jobs.
* Cannot be invoiced twice.

---

# 8. Design Aggregate

## Purpose

Represents a reusable embroidery design.

Designs are business assets rather than temporary uploads.

---

## Responsibilities

Owns:

* Design Metadata
* Design Files
* Usage History

---

## Business Invariants

A Design:

* May be reused across many Jobs.
* May contain multiple file formats.
* Cannot be deleted if referenced by historical Job Items.
* Maintains its identity independently of individual files.

---

# 9. Invoice Aggregate

## Purpose

Represents a financial request for payment.

Invoices are financial documents rather than operational records.

---

## Responsibilities

Owns:

* Invoice
* Invoice Items
* Financial Totals
* Outstanding Balance

---

## Business Invariants

An Invoice:

* Belongs to one Customer.
* Contains one or more Invoice Items.
* Invoice Items are immutable after issuance.
* Totals are system calculated.
* Status follows the defined state machine.
* Historical totals never change.

---

# 10. Invoice Item Entity

## Purpose

Represents a snapshot of completed work being billed.

Invoice Items preserve historical pricing and quantities.

---

## Business Invariants

An Invoice Item:

* Belongs to one Invoice.
* References one completed Job Item.
* Stores copied pricing information.
* Cannot be modified after issuance.

---

# 11. Payment Aggregate

## Purpose

Represents money received from a customer.

---

## Responsibilities

Owns:

* Payment Information
* Allocation Records

---

## Business Invariants

A Payment:

* Belongs to one Customer.
* May allocate to multiple Invoices.
* Amount must equal the sum of its allocations.
* Cannot be modified after confirmation.

---

# 12. Payment Allocation Entity

## Purpose

Connects Payments to Invoices.

Supports:

* Partial payments
* Multiple invoices
* Multiple payments

---

## Business Invariants

A Payment Allocation:

* Belongs to one Payment.
* References one Invoice.
* Allocation amount must be positive.
* Total allocations cannot exceed payment amount.
* Invoice balance cannot become negative.

---

# 13. Attachment Entity

## Purpose

Represents supporting business documents.

Examples:

* Purchase Orders
* Approval Sheets
* Reference Images
* Receipts

Attachments are not business entities by themselves but provide supporting evidence for operational records.

---

# 14. Settings Aggregate

## Purpose

Stores application-wide configuration.

Examples:

* Business Profile
* Numbering Rules
* Regional Settings
* Security Configuration

---

## Business Invariants

Settings:

* Exist as a singleton aggregate.
* Affect system behavior globally.
* Changes require administrative permission.
* Important changes must be audited.

---

# 15. Aggregate Relationships

```text id="1tgjyl"
Customer
    │
    ├────────► Jobs
    │              │
    │              ▼
    │         Job Items
    │              │
    │              ▼
    │          Designs
    │
    ├────────► Invoices
    │              │
    │              ▼
    │        Invoice Items
    │
    └────────► Payments
                   │
                   ▼
          Payment Allocations
                   │
                   ▼
               Invoices
```

Relationships describe business ownership rather than database implementation.

---

# 16. Cross-Aggregate Rules

The following rules span multiple aggregates:

* A Job cannot exist without a Customer.
* A Job Item cannot exist without a Job.
* An Invoice cannot be issued without completed Job Items.
* A Payment cannot allocate more than the invoice's outstanding balance.
* Archiving a Customer must not remove historical financial records.
* A Design referenced by historical work must remain available for audit purposes.

These rules are enforced by the Domain Layer, not the database.

---

# 17. Domain Events

Important business events include:

* CustomerCreated
* CustomerArchived
* JobCreated
* JobCompleted
* JobItemCompleted
* DesignUploaded
* InvoiceIssued
* PaymentRecorded
* PaymentConfirmed
* SettingsUpdated

Events are emitted only after successful business operations.

---

# 18. Domain Integrity Principles

The following principles apply to every aggregate:

1. Aggregate Roots enforce business consistency.
2. Child entities are modified only through their Aggregate Root.
3. Financial records become immutable after confirmation.
4. Business rules take precedence over technical convenience.
5. Aggregate boundaries should remain stable over time.

---

# End of Document
