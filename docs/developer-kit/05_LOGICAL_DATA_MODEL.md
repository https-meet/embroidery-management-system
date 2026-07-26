# 05_LOGICAL_DATA_MODEL.md

**Project:** Embroidery Business Management System (EBMS)

**Developer Kit Version:** 1.0

**Document Version:** 1.0

**Status:** Approved

---

# 1. Purpose

The Logical Data Model defines the business relationships between all major entities in EBMS.

This document represents the **conceptual structure of business data**.

It is independent of:

* PostgreSQL
* Prisma ORM
* SQL
* Column types
* Indexes
* Foreign keys
* Database implementation details

The objective is to model **business information**, not database tables.

---

# 2. Modeling Principles

The Logical Data Model follows these principles:

### LM-001 Business First

Relationships are derived from business requirements rather than technical implementation.

---

### LM-002 Technology Independent

The model must remain valid even if the persistence technology changes.

---

### LM-003 Stable Business Concepts

Entities represent long-term business concepts rather than temporary implementation choices.

---

### LM-004 Single Source of Truth

Each business fact has one authoritative owner.

---

### LM-005 Explicit Relationships

Every relationship between entities must be clearly defined.

Implicit relationships are not permitted.

---

# 3. Entity Catalog

The following entities make up the business domain.

## Core Business Entities

* Customer
* Job
* Job Item
* Design
* Invoice
* Invoice Item
* Payment
* Payment Allocation
* Attachment
* Settings

These entities represent the official business vocabulary defined in the Domain Model.

---

# 4. High-Level Business Relationship Map

```text
Customer
│
├──────────────► Jobs
│                     │
│                     ▼
│               Job Items
│                     │
│                     ▼
│                  Designs
│
├──────────────► Invoices
│                     │
│                     ▼
│               Invoice Items
│
└──────────────► Payments
                      │
                      ▼
             Payment Allocations
                      │
                      ▼
                  Invoices
```

The arrows represent business relationships and ownership rather than database foreign keys.

---

# 5. Entity Relationships

## Customer → Job

### Relationship

One Customer may have many Jobs.

Each Job belongs to exactly one Customer.

---

### Cardinality

```
Customer (1)

↓

Job (0..*)
```

---

### Business Meaning

Jobs cannot exist independently.

Every production order originates from a customer.

---

## Job → Job Item

### Relationship

A Job contains one or more Job Items.

A Job Item belongs to exactly one Job.

---

### Cardinality

```
Job (1)

↓

Job Item (1..*)
```

---

### Business Meaning

Job Items represent the individual embroidery operations that collectively make up a production order.

---

## Job Item → Design

### Relationship

A Job Item references one Design.

A Design may be reused across many Job Items.

---

### Cardinality

```
Design (1)

↑

Job Item (0..*)
```

---

### Business Meaning

Designs are reusable business assets.

---

## Customer → Invoice

### Relationship

One Customer may receive many Invoices.

Each Invoice belongs to exactly one Customer.

---

### Cardinality

```
Customer (1)

↓

Invoice (0..*)
```

---

## Invoice → Invoice Item

### Relationship

An Invoice contains one or more Invoice Items.

Each Invoice Item belongs to exactly one Invoice.

---

### Cardinality

```
Invoice (1)

↓

Invoice Item (1..*)
```

---

### Business Meaning

Invoice Items preserve the financial snapshot of billed work.

---

## Invoice Discount

### Relationship

A Discount is an optional attribute of an Invoice. It is not a separate entity.

### Business Meaning

An Invoice may carry an optional Discount with the following attributes:

* Discount Type — PERCENTAGE or FIXED AMOUNT
* Discount Value — the percentage (0–100) or fixed monetary amount entered by the user
* Discount Amount — the calculated monetary reduction, frozen at issuance and never changed

Grand Total = Subtotal − Discount Amount

The Discount Amount is part of the Invoice financial snapshot (see ADR-004 and ADR-016).

---

## Job Item → Invoice Item

### Relationship

A completed Job Item may produce one Invoice Item.

---

### Cardinality

```
Job Item (0..1)

↓

Invoice Item (1)
```

---

### Business Meaning

Work cannot be billed more than once.

---

## Customer → Payment

### Relationship

A Customer may make multiple Payments.

Each Payment belongs to exactly one Customer.

---

### Cardinality

```
Customer (1)

↓

Payment (0..*)
```

---

## Payment → Payment Allocation

### Relationship

A Payment contains one or more Payment Allocations.

---

### Cardinality

```
Payment (1)

↓

Payment Allocation (1..*)
```

---

## Payment Allocation → Invoice

### Relationship

Each Payment Allocation references one Invoice.

One Invoice may receive many Payment Allocations.

---

### Cardinality

```
Invoice (0..*)

↑

Payment Allocation (1)
```

---

### Business Meaning

Supports:

* Partial payments
* Multiple payments
* Multi-invoice payments

---

## Attachment Relationships

Attachments may be associated with:

* Customer
* Job
* Job Item
* Invoice

Payments do not support attachments in Version 1.

Design files are managed separately through the Design aggregate and are not represented as generic Attachments.

Attachment ownership depends on the business object they support.

---

## Settings

Settings are global.

They do not belong to any individual business entity.

There is exactly one logical Settings aggregate for the application.

---

# 6. Aggregate Ownership

Aggregate ownership defines which entity is responsible for maintaining consistency.

| Aggregate Root | Owned Entities     |
| -------------- | ------------------ |
| Customer       | Timeline (future)  |
| Job            | Job Item           |
| Design         | Design Files       |
| Invoice        | Invoice Item       |
| Payment        | Payment Allocation |
| Settings       | Configuration      |

Child entities must be modified through their Aggregate Root.

---

# 7. Lifecycle Dependencies

The lifecycle of certain entities depends on others.

| Parent   | Child              | Dependency                                |
| -------- | ------------------ | ----------------------------------------- |
| Customer | Job                | Job cannot exist without Customer         |
| Job      | Job Item           | Job Item cannot exist without Job         |
| Invoice  | Invoice Item       | Invoice Item cannot exist without Invoice |
| Payment  | Payment Allocation | Allocation cannot exist without Payment   |

Parent archival must preserve historical business records.

---

# 8. Referential Business Rules

The following business relationships must always remain valid:

* A Job always belongs to one Customer.
* A Job Item always belongs to one Job.
* An Invoice always belongs to one Customer.
* An Invoice Item always belongs to one Invoice.
* A Payment always belongs to one Customer.
* A Payment Allocation always references one Invoice.
* A Design may be referenced by many Job Items.
* Historical references must remain valid after archival.

---

# 9. Relationship Matrix

| Entity             | Related To         | Relationship       |
| ------------------ | ------------------ | ------------------ |
| Customer           | Job                | One-to-Many        |
| Customer           | Invoice            | One-to-Many        |
| Customer           | Payment            | One-to-Many        |
| Job                | Job Item           | One-to-Many        |
| Job Item           | Design             | Many-to-One        |
| Job Item           | Invoice Item       | One-to-Zero-or-One |
| Invoice            | Invoice Item       | One-to-Many        |
| Payment            | Payment Allocation | One-to-Many        |
| Payment Allocation | Invoice            | Many-to-One        |

---

# 10. Conceptual ER Diagram

```text
Customer
│
├── Jobs
│      └── Job Items
│               └── Design
│
├── Invoices
│      └── Invoice Items
│               ▲
│               │
│          Job Item
│
└── Payments
       └── Payment Allocations
                  │
                  ▼
              Invoice
```

This diagram illustrates conceptual relationships only.

Implementation details are defined in the Database Design document.

---

# 11. Data Integrity Goals

The logical model is designed to ensure:

* Clear ownership of business data
* Consistent business relationships
* Preservation of historical records
* Support for future system growth
* Independence from implementation technology

---

# 12. Transition to Physical Design

This document defines **what** the business data looks like conceptually.

The next document, **06_DATABASE_DESIGN.md**, defines **how** that model is implemented using PostgreSQL and Prisma.

---

# End of Document
