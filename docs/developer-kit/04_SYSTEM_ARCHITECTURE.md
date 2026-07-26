# 04_SYSTEM_ARCHITECTURE.md

**Project:** Embroidery Business Management System (EBMS)

**Developer Kit Version:** 1.0

**Document Version:** 1.0

**Status:** Approved

**Author:** Software Architecture Team

**Last Updated:** July 2026

---

# Revision History

| Version | Date      | Author            | Changes                                            |
| ------- | --------- | ----------------- | -------------------------------------------------- |
| 1.0     | July 2026 | Architecture Team | Initial architecture specification                 |
| 1.0     | July 2026 | Architecture Team | Developer Kit v1.0 — approved decisions applied    |

---

# Table of Contents

1. Document Overview
2. Executive Summary
3. System Vision
4. Architecture Goals
5. Non-Functional Requirements
6. Architecture Principles
7. Architecture Style
8. High-Level Architecture
9. Layered Architecture
10. Module Architecture
11. Architecture Decision Records
12. Technology Stack
13. Glossary

---

# 1. Document Overview

## Purpose

This document defines the official software architecture for the Embroidery Business Management System (EBMS).

It serves as the single source of truth for all architectural decisions made throughout the lifetime of the project.

This document is intended for:

* Software Architects
* Backend Developers
* Frontend Developers
* QA Engineers
* AI Coding Assistants
* Future Contributors

---

## Scope

This document defines:

* Overall architecture
* Module boundaries
* Dependency rules
* System communication
* Engineering principles
* Technology decisions
* Scalability strategy

It intentionally does **not** define:

* Database schema
* API endpoints
* UI design
* Business workflows

Those topics are covered in dedicated documents.

---

# 2. Executive Summary

The Embroidery Business Management System (EBMS) is designed as a production-ready commercial business application for managing the complete embroidery business lifecycle.

The architecture emphasizes:

* Long-term maintainability
* High code quality
* Predictable scalability
* Business-first design
* Simplicity over unnecessary complexity

Rather than optimizing for theoretical scale, EBMS is optimized for delivering reliable business value while remaining flexible enough to grow into a commercial SaaS platform.

The chosen architecture is a **Modular Monolith**, allowing clear separation of business domains while avoiding the operational complexity of distributed systems.

---

# 3. System Vision

The goal of EBMS is not simply to digitize paperwork.

The goal is to become the operational backbone of an embroidery business.

The system manages:

* Customer relationships
* Production jobs
* Design assets
* Financial operations
* Business reporting
* Business configuration

Every architectural decision should support this long-term vision.

---

# 4. Architecture Goals

The architecture has the following primary objectives.

## AG-001 Maintainability

The system should remain understandable and maintainable for many years.

Code should be organized by business capability rather than technical framework.

---

## AG-002 Scalability

The architecture should comfortably support growth in:

* Customers
* Jobs
* Designs
* Financial transactions
* Users

without requiring architectural redesign.

---

## AG-003 Reliability

Business operations should execute safely and consistently.

Financial records must preserve historical accuracy.

System failures must never leave business data in an inconsistent state.

---

## AG-004 Testability

Business rules should be independently testable.

Architecture should encourage automated testing at every layer.

---

## AG-005 Simplicity

Simple architecture is preferred over complex architecture.

Complexity should only be introduced when it solves a proven business problem.

---

## AG-006 Extensibility

New modules should integrate into the existing architecture without requiring widespread modifications.

Future features should extend the architecture rather than replace it.

---

# 5. Non-Functional Requirements

## Performance

Target API response time:

* Standard operations: under 300 ms
* Search operations: under 500 ms
* Dashboard loading: under 2 seconds

These targets assume normal operating conditions and typical business data volumes.

---

## Availability

Target availability:

99.5% or higher.

Planned maintenance windows should be scheduled outside normal business hours whenever possible.

---

## Security

The system must:

* Encrypt passwords using a modern password hashing algorithm.
* Authenticate every protected request.
* Authorize every business operation.
* Validate all user input.
* Protect uploaded files.
* Record important security events.

---

## Reliability

The application must guarantee:

* Transaction consistency.
* Atomic financial operations.
* Data durability.
* Graceful error recovery.

---

## Auditability

Important financial and administrative actions must be traceable.

Historical business records should remain available for auditing and reporting purposes.

---

## Usability

The application should prioritize:

* Fast navigation.
* Minimal clicks.
* Consistent interfaces.
* Clear validation messages.
* Predictable workflows.

---

# 6. Architecture Principles

All engineering decisions should follow these principles.

## AP-001 Business Before Technology

Technology choices must support business requirements rather than dictate them.

---

## AP-002 Modular Design

Each business capability exists within its own module.

Modules own their own logic and data access.

---

## AP-003 Separation of Concerns

Presentation, application orchestration, domain logic, and infrastructure must remain clearly separated.

Each layer has one responsibility.

---

## AP-004 Single Source of Truth

Every piece of business information should have one authoritative owner.

Duplicate business logic should never exist.

---

## AP-005 Immutable Financial Records

Issued invoices and confirmed payments become permanent historical records.

Corrections occur through additional transactions rather than editing history.

---

## AP-006 Explicit Dependencies

Dependencies should always be visible.

Hidden framework behavior should be minimized.

---

## AP-007 Fail Fast

Invalid requests should be rejected as early as possible.

The system should never continue processing invalid business operations.

---

## AP-008 Secure by Default

Every resource is considered protected unless explicitly designated as public.

Security is an architectural responsibility, not an afterthought.

---

# 7. Architecture Style

## Selected Style

The official architecture style for EBMS is:

**Modular Monolith**

---

## Why Modular Monolith?

A Modular Monolith provides:

* Simple deployment
* Clear module ownership
* Low operational overhead
* Excellent developer productivity
* Straightforward debugging
* Strong support for AI-assisted development

The architecture allows future extraction of individual modules into separate services if justified by business growth.

---

## Why Not Microservices?

Microservices introduce additional complexity including:

* Distributed transactions
* Network latency
* Service discovery
* Independent deployments
* Infrastructure overhead
* Monitoring complexity

These costs are not justified for the expected scale of Version 1.

The architecture deliberately favors simplicity while preserving future flexibility.

---

# 8. High-Level Architecture

```text
                    React Frontend
                           │
                           ▼
                     REST API Layer
                           │
                           ▼
                 Application Services
                           │
                           ▼
                    Business Modules
┌────────────────────────────────────────────────────┐
│ Customers │ Jobs │ Designs │ Invoices │ Payments   │
│ Reports   │ Search │ Settings │ Attachments        │
└────────────────────────────────────────────────────┘
                           │
                           ▼
                  Infrastructure Layer
          Database │ Storage │ Logging │ Config
                           │
                           ▼
                       PostgreSQL
```

Every request follows this architectural path.

Direct access between unrelated layers is prohibited.

---

# 9. Layered Architecture

The application is divided into four primary layers.

## Presentation Layer

Responsibilities:

* HTTP endpoints
* Request parsing
* Authentication entry
* Response formatting

This layer contains no business rules.

---

## Application Layer

Responsibilities:

* Execute use cases
* Coordinate multiple modules
* Manage transactions
* Publish domain events

This layer orchestrates workflows without owning business rules.

---

## Domain Layer

Responsibilities:

* Business rules
* State transitions
* Financial calculations
* Business validation
* Domain services

This is the core of the application.

The Domain Layer must remain independent of frameworks, databases, and transport protocols.

---

## Infrastructure Layer

Responsibilities:

* Database access
* File storage
* Logging
* External integrations
* Configuration

Infrastructure implements technical concerns while remaining replaceable.

---

# 10. Module Architecture

Every business module follows a consistent internal structure.

```text
modules/
└── invoices/
    ├── controllers/
    ├── services/
    ├── validators/
    ├── repositories/
    ├── dto/
    ├── routes/
    ├── tests/
    └── index.ts
```

This standard structure provides:

* Predictability
* Consistency
* Easier onboarding
* Better AI-generated code quality

Each module owns:

* Business logic
* Validation
* Persistence
* Tests

No module should directly manipulate another module's internal implementation.

---

# 11. Architecture Decision Records (ADR)

Major architectural decisions must be documented.

Initial approved decisions include:

ADR-001 — Modular Monolith

ADR-002 — UUID Primary Keys

ADR-003 — Soft Delete Strategy

ADR-004 — Invoice Snapshot Architecture

ADR-005 — Payment Allocation Model

ADR-006 — Role-Based Access Control

ADR-007 — Domain-Oriented Module Structure

Future architectural changes must be recorded as new ADRs in 13_ADR_INDEX.md rather than silently modifying previous decisions.

The official ADR Index is maintained in: 13_ADR_INDEX.md

---

# 12. Technology Stack

Repository Structure

* pnpm Workspace Monorepo
* apps/backend — Node.js / Express / Prisma API
* apps/frontend — React / Vite SPA
* packages/shared — Shared TypeScript types, DTOs, constants
* packages/config — Shared ESLint, Prettier, TypeScript base configurations

Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* TanStack Query
* React Hook Form

Backend

* Node.js
* TypeScript
* Express

Database

* PostgreSQL (hosted on Supabase)
* Prisma ORM

File Storage

* Supabase Storage (S3-compatible cloud object storage)
* Accessed through FileStorageService abstraction layer (see ADR-015)

Authentication

* JWT Access Tokens
* JWT Refresh Tokens
* bcrypt
* Role-Based Access Control (RBAC)

Testing

* Jest

Development Tools

* ESLint
* Prettier
* pnpm

Future additions should be evaluated against existing architectural principles before adoption.

---

# 13. Glossary

**Domain**

A business capability that owns its own rules and data.

---

**Module**

A self-contained implementation of a business domain.

---

**Use Case**

A business operation performed by the application.

Examples:

* Create Customer
* Issue Invoice
* Confirm Payment

---

**Repository**

The persistence abstraction responsible for storing and retrieving business data.

---

**Transaction**

A group of operations that either complete successfully together or fail together.

---

**Domain Event**

A business event emitted after a significant operation.

Examples:

* InvoiceIssued
* PaymentConfirmed
* JobCompleted

---

**Architecture Decision Record (ADR)**

A permanent record documenting an important architectural decision, its rationale, and its consequences.

---


---

# 14. Architecture Constraints

Architecture Constraints define mandatory engineering rules.

These rules are non-negotiable and apply to every contributor, regardless of experience or implementation approach.

Violations should be treated as architecture defects rather than coding style issues.

---

## AC-001 Controllers Must Not Contain Business Logic

Controllers are responsible only for:

* Receiving requests
* Invoking application services
* Returning responses

Controllers must never:

* Calculate totals
* Validate business rules
* Access the database directly
* Perform financial calculations
* Manage transactions

---

## AC-002 Domain Logic Must Not Depend on Frameworks

Business rules must remain independent of:

* Express
* Prisma
* PostgreSQL
* HTTP
* JWT
* File Storage Providers

The Domain Layer should be portable and testable without infrastructure.

---

## AC-003 Modules Own Their Business Rules

Each module owns its own behavior.

Examples:

Customer Module owns customer validation.

Invoice Module owns invoice rules.

Payment Module owns payment allocation.

Other modules may request information through public interfaces but must never implement another module's rules.

---

## AC-004 Direct Database Access Is Forbidden

Only repositories may communicate with the database.

The following are prohibited:

Controller → Prisma

Service → SQL

Middleware → Database

Every database interaction must pass through the repository layer.

---

## AC-005 Financial Records Become Immutable

Once an Invoice is issued:

* Totals cannot change.
* Invoice Items cannot change.

Once a Payment is confirmed:

* Amount cannot change.
* Allocations cannot change.

Corrections must be represented through new financial transactions.

---

## AC-006 Shared Module Must Remain Generic

The Shared module may contain:

* Utility functions
* Authentication helpers
* Logging
* Validation helpers
* Common error classes

It must never contain business logic.

---

## AC-007 No Circular Dependencies

Modules must not depend on each other cyclically.

Example:

Customer → Job → Customer

This dependency chain is prohibited.

Dependency flow should always remain acyclic.

---

## AC-008 Soft Delete Is the Default

Operational records are archived rather than permanently deleted.

Hard deletion is reserved for exceptional administrative or legal requirements.

---

## AC-009 Every Business Operation Must Be Auditable

Financial and administrative operations must generate audit records.

Examples:

* Invoice Issued
* Payment Confirmed
* Customer Archived
* Settings Updated

---

## AC-010 Every Public API Must Be Documented

New endpoints require:

* Request schema
* Response schema
* Validation rules
* Error codes
* Permission requirements

Implementation without documentation is not considered complete.

---

# 15. Request Lifecycle

Every HTTP request follows the same lifecycle.

```text
Client
   │
   ▼
Authentication
   │
   ▼
Authorization
   │
   ▼
Request Validation
   │
   ▼
Controller
   │
   ▼
Application Service
   │
   ▼
Business Validation
   │
   ▼
Repository
   │
   ▼
Database
   │
   ▼
Response Formatter
   │
   ▼
Client
```

No layer may be skipped.

This consistency simplifies testing, debugging, and maintenance.

---

# 16. Authentication & Authorization

## Authentication

Authentication verifies the identity of the user.

Version 1 supports:

* Username or Email
* Password
* JWT Access Token (short-lived)
* JWT Refresh Token (longer-lived, rotated on use)

Authentication endpoints:

| Endpoint | Purpose |
| -------- | ------- |
| POST /api/v1/auth/login | Authenticate and receive access + refresh tokens |
| POST /api/v1/auth/refresh | Exchange refresh token for new tokens |
| POST /api/v1/auth/logout | Invalidate the refresh token |

Future versions may add:

* Google Sign-In
* Microsoft Sign-In
* Two-Factor Authentication

---

## Authorization

Authorization determines whether an authenticated user may perform a specific action.

The system follows Role-Based Access Control (RBAC).

Permission examples:

Customer.Create

Customer.Edit

Invoice.Issue

Payment.Confirm

Settings.Update

Permissions should be referenced by descriptive names rather than numeric identifiers.

---

## User Lifecycle

```text
Created
   │
   ▼
Active
   │
   ▼
Inactive

(Future)

Locked
```

Inactive users retain historical ownership of records but cannot authenticate.

---

# 17. Validation Architecture

Validation occurs in two distinct stages.

## Request Validation

Ensures the incoming request is structurally valid.

Examples:

* Required fields
* Data types
* Email format
* UUID format
* Maximum length

---

## Business Validation

Ensures the requested action is permitted by business rules.

Examples:

* Customer exists.
* Invoice is unpaid.
* Job Item is completed.
* Payment allocation is valid.

Separating these responsibilities improves readability and testability.

---

# 18. Error Handling Strategy

Errors are classified into meaningful categories.

```text
ApplicationError
│
├── ValidationError
├── AuthenticationError
├── AuthorizationError
├── NotFoundError
├── ConflictError
├── BusinessRuleError
└── InternalServerError
```

Every exception should include:

* Error Code
* User-Friendly Message
* Technical Context (Logs Only)

---

## Standard API Response

Successful responses:

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { }
}
```

Business / Domain Error responses (entity not found, rule violations, invalid state transitions):

```json
{
  "success": false,
  "error": {
    "code": "INVOICE_ALREADY_ISSUED",
    "message": "This invoice has already been issued and cannot be edited."
  }
}
```

Validation Error responses (missing fields, invalid types, format violations):

```json
{
  "success": false,
  "errors": [
    {
      "field": "customerName",
      "message": "Customer name is required."
    }
  ]
}
```

The two error shapes serve distinct purposes. See ADR-012 for rationale.

Error codes use SCREAMING_SNAKE_CASE. They are part of the public API contract.

---

# 19. Transaction Management

Business operations involving multiple persistent changes execute within a single transaction.

Example:

Issue Invoice

```text
Begin Transaction
      │
Validate Customer
      │
Create Invoice
      │
Create Invoice Items
      │
Update Job Items
      │
Commit
```

If any step fails:

```text
Rollback Transaction
```

Partial financial updates are unacceptable.

---

# 20. State Machine Architecture

Status transitions are centrally defined.

## Job

```text
Draft
  │
  ▼
In Progress
  │
  ▼
Completed
  │
  ▼
Delivered

Cancelled
```

---

## Job Item

```text
Draft
  │
  ▼
Pending Production
  │
  ▼
In Production
  │
  ▼
Completed

Cancelled
```

---

## Invoice

```text
Draft
  │
  ▼
Issued
  │
  ▼
Partially Paid
  │
  ▼
Paid
```

---

## Payment

```text
Draft
  │
  ▼
Confirmed
```

Only documented transitions are valid.

All others must be rejected.

---

# 21. Domain Events

Domain Events notify the system that a significant business action has occurred.

Examples:

CustomerCreated

JobCompleted

InvoiceIssued

PaymentConfirmed

DesignUploaded

Events enable future integrations without tightly coupling modules.

Example:

```text
Invoice Issued
      │
      ├── Update Dashboard
      ├── Refresh Reports
      ├── Write Audit Log
      └── Future Email Notification
```

Modules publish events without knowledge of subscribers.

---

# 22. Audit Logging

Business software requires an immutable audit trail.

Audit records should capture:

* Timestamp
* User
* Entity Type
* Entity Identifier
* Action
* Previous Value (optional)
* New Value (optional)

Examples:

Customer Created

Invoice Issued

Payment Confirmed

Settings Updated

Audit logs are distinct from application logs.

They exist to provide business accountability and historical traceability.

---

# 23. Logging Strategy

The application uses structured logging.

Log Levels:

INFO

Normal business operations.

WARN

Recoverable or suspicious situations.

ERROR

Unexpected application failures.

FATAL

Critical failures preventing normal application operation.

Every log entry should include a Correlation ID to support end-to-end request tracing.

---


---

# 24. Data Access & Persistence Architecture

## Overview

The persistence layer is responsible for storing and retrieving business data while remaining transparent to the business domain.

The Domain Layer decides **what** should happen.

The Repository Layer decides **how** it is persisted.

The database is treated as an implementation detail rather than the center of the application.

---

## Persistence Flow

```text
HTTP Request
      │
      ▼
Controller
      │
      ▼
Application Service
      │
      ▼
Domain Service
      │
      ▼
Repository Interface
      │
      ▼
Prisma Repository
      │
      ▼
PostgreSQL
```

Every database operation follows this path.

---

## Repository Responsibilities

Repositories are responsible for:

* Reading business data
* Persisting changes
* Query optimization
* Pagination
* Filtering
* Executing transactional persistence

Repositories must never:

* Perform authorization
* Execute business rules
* Calculate financial values
* Change business state

---

## Persistence Standards

* UUIDs are used as primary identifiers.
* Business-friendly numbers remain separate.
* Soft Delete is the default lifecycle strategy.
* Audit fields are included in all major entities.
* Database changes occur exclusively through migrations.
* Manual schema changes in production are prohibited.

---

# 25. Read & Write Architecture

Although EBMS does not implement full CQRS, it distinguishes between write operations and read operations.

## Write Operations

Examples:

* Create Customer
* Create Job
* Issue Invoice
* Confirm Payment

Characteristics:

* Strict validation
* Business rules enforced
* Transactions required
* Consistency prioritized

---

## Read Operations

Examples:

* Dashboard
* Reports
* Search
* Customer History

Characteristics:

* Optimized queries
* Read-only
* Pagination
* Filtering
* Sorting

Read operations may use specialized repository methods for performance without changing business rules.

---

# 26. File Storage Architecture

Files are business assets and require structured management.

## Supported Categories

* Design Files
* Reference Images
* Purchase Orders
* Approval Documents
* Receipts
* Other Attachments

Each file stores metadata including:

* Original filename
* Stored filename
* File size
* MIME type
* Upload timestamp
* Uploaded by
* Associated business entity

---

## Storage Strategy

Version 1:

Supabase Storage (S3-compatible cloud object storage).

All file operations are performed through the `FileStorageService` interface (see ADR-015).

Version 1 implementation: `SupabaseFileStorageService`

FileStorageService interface responsibilities:

* Upload file — stores the binary and returns a reference
* Download file — retrieves the binary by reference
* Delete file — removes the binary from storage
* Generate access URL — returns a signed or public URL for frontend display

File metadata (filename, size, MIME type, entity association) is stored in the PostgreSQL `attachments` table.

Binary file content is stored in Supabase Storage.

The application must never import or call storage provider SDKs directly. All storage operations must go through the FileStorageService abstraction.

Future versions may replace the storage provider by implementing a new adapter:

* AWS S3
* Cloudflare R2
* Azure Blob Storage
* Google Cloud Storage

Replacing the storage provider requires only a new FileStorageService implementation. No business logic changes.

---

# 27. Search Architecture

Search is treated as a core system capability.

Users should not need to remember exact identifiers.

Supported search targets include:

* Customers
* Jobs
* Job Items
* Designs
* Invoices
* Payments

---

## Search Principles

The search engine should support:

* Partial matching
* Business identifiers
* Customer names
* Status filtering
* Date filtering

Results should be grouped by entity type.

---

## Future Enhancements

Potential future improvements include:

* Full-text search
* Search suggestions
* Recently viewed items
* Saved searches
* Advanced filtering

---

# 28. Reporting Architecture

Reports are designed to answer business questions rather than simply display database records.

Examples:

Operational Reports

* Active Jobs
* Pending Deliveries
* Production Status

Financial Reports

* Outstanding Invoices
* Revenue
* Payment History

Analytical Reports

* Customer Trends
* Design Usage
* Monthly Growth

---

## Reporting Principles

Reports must:

* Be read-only
* Never modify business data
* Support filtering
* Support exporting
* Remain reproducible

---

# 29. Performance Strategy

Performance is considered during architecture rather than after deployment.

## General Principles

* Query only required fields.
* Avoid unnecessary joins.
* Use pagination.
* Prevent N+1 queries.
* Create appropriate database indexes.
* Cache relatively static configuration data.

---

## Database Performance

Indexes should exist for commonly searched business fields.

Examples:

Customer Code

Invoice Number

Job Number

Phone Number

Status

Creation Date

Indexing decisions should be based on business workflows and measured performance.

---

## Frontend Performance

The frontend should:

* Lazy-load large modules.
* Minimize unnecessary rendering.
* Cache static resources.
* Optimize network requests.
* Provide loading indicators for long-running operations.

---

# 30. Security Architecture

Security is implemented as a layered responsibility.

## Authentication

Identity verification.

---

## Authorization

Permission verification.

---

## Validation

Input verification.

---

## Audit

Business accountability.

---

## Logging

Operational visibility.

---

## Data Protection

Sensitive information must be protected at rest and in transit.

Examples include:

* Password hashes
* Access tokens
* Business documents
* Uploaded files

---

## Security Principles

Least privilege.

Secure defaults.

Defense in depth.

Explicit permissions.

Input validation.

Output encoding where appropriate.

---

# 31. Deployment Architecture

Version 1 targets a single production deployment.

```text
Users
   │
   ▼
React Frontend
   │
   ▼
Node.js API
   │
   ▼
PostgreSQL
```

Future deployments may introduce:

* Reverse proxy
* CDN
* Load balancer
* Object storage
* Background workers

without changing the application architecture.

---

# 32. Monitoring & Observability

The application should expose sufficient operational information to support maintenance and troubleshooting.

## Monitoring Areas

Application availability

Response times

Database health

Storage utilization

Authentication failures

Unhandled exceptions

---

## Observability Goals

Operators should be able to answer:

* What failed?
* When did it fail?
* Which user was affected?
* Which request caused the issue?
* How can it be reproduced?

---

# 33. Backup & Disaster Recovery

Backups are an operational responsibility as well as a business requirement.

Data loss is unacceptable. This section defines the minimum operational backup policy.

## Backup Policy

| Component | Mechanism | Frequency |
| --------- | --------- | --------- |
| PostgreSQL (Production) | Supabase Pro automated backup + PITR (7-day window) | Daily + continuous |
| PostgreSQL (Development) | Manual pg_dump before major schema migrations | On demand |
| File Storage | Supabase Storage internal replication | Continuous |
| Pre-deployment | Full pg_dump exported before every production deployment | Per deployment |

## Backup Verification

A backup that has never been tested is not a reliable backup.

Verification requirements:

* Perform a full database restoration test on a separate Supabase project at minimum once per month.
* Verify that the restored database is consistent: all foreign keys intact, all financial records present, all statuses valid.
* Document the restoration time and any issues encountered.
* If a restoration test fails, treat it as a production incident.

## Recovery Procedures

In the event of data loss or corruption:

1. Identify the last known good state using Supabase PITR or the most recent manual backup.
2. Restore to a staging environment first — never restore directly to production without validation.
3. Validate data integrity before switching production traffic to the restored environment.
4. Document the incident: what was lost, what was recovered, what caused the failure.
5. Review and update backup procedures if the incident exposed a gap.

Business continuity depends on proven recovery procedures, not merely on backup existence.

---

# 34. Scalability Roadmap

The architecture is intentionally designed for incremental growth.

## Phase 1

Single application

Single database

Local storage

---

## Phase 2

Cloud file storage

Improved monitoring

Background workers

Read replicas if required

---

## Phase 3

Distributed caching

Event-driven integrations

External APIs

Notification services

---

## Phase 4

Potential service extraction based on proven scaling requirements.

Microservices remain an architectural option rather than an immediate goal.

---

# 35. Coding Principles

All implementation should follow these engineering standards.

* Business-first design
* SOLID principles
* Small focused classes
* Explicit dependencies
* Consistent naming
* Comprehensive testing
* Meaningful logging
* Self-documenting code
* Minimal duplication
* Predictable error handling

Architecture should always take precedence over personal coding preferences.

---

# 36. Risks & Trade-offs

Every architecture involves trade-offs.

## Accepted Trade-offs

### Modular Monolith

Pros:

* Simpler deployment
* Easier debugging
* Lower infrastructure cost

Cons:

* Shared deployment
* Shared database

---

### UUID Primary Keys

Pros:

* Globally unique
* Safe for distributed systems
* Harder to guess

Cons:

* Larger indexes
* Less human-readable

---

### Soft Delete

Pros:

* Historical traceability
* Audit support
* Safer operations

Cons:

* Larger database size
* Additional filtering logic

These trade-offs are considered acceptable for the business goals of EBMS.

---

# 37. Future Evolution

The architecture anticipates future capabilities without prematurely implementing them.

Potential enhancements include:

* Multi-tenancy
* Mobile applications
* AI-assisted production planning
* Inventory management
* Barcode and QR code workflows
* Customer self-service portal
* WhatsApp integration
* Accounting software integration
* Business intelligence dashboards

New capabilities should extend the architecture while preserving existing principles.

---

# 38. Architecture Checklist

Before implementing any new feature, verify the following:

* Does it belong to the correct module?
* Are business rules located in the Domain Layer?
* Is database access performed through a repository?
* Is authorization enforced?
* Is input validated?
* Is the operation auditable?
* Are transactions required?
* Are tests included?
* Is documentation updated?
* Does the implementation comply with existing ADRs?

Only when every answer is "Yes" should the feature be considered architecturally complete.

---

# End of Document

# Appendix A – Architecture Diagrams

This appendix provides visual representations of the system architecture.

These diagrams complement the written specification and should be considered part of the official architecture documentation.

---

# A.1 System Context Diagram (C4 Model – Level 1)

The System Context Diagram defines the boundary of EBMS and its interactions with users and external systems.

```text
                    ┌────────────────────┐
                    │ Business Owner     │
                    └─────────┬──────────┘
                              │
                    Uses Web Application
                              │
                              ▼
        ┌────────────────────────────────────────┐
        │                                        │
        │    Embroidery Business Management      │
        │              System (EBMS)             │
        │                                        │
        └────────────────┬───────────────────────┘
                         │
        ┌────────────────┼───────────────────┐
        │                │                   │
        ▼                ▼                   ▼

PostgreSQL        File Storage        Future Integrations
 Database        (Designs/Documents)  (WhatsApp, Email,
                                     Accounting APIs)
```

### Primary Users

* Business Owner
* Administrator
* Staff (Future)

### External Dependencies

* PostgreSQL
* Local File Storage
* Cloud Storage (Future)
* Email Service (Future)
* WhatsApp API (Future)
* Accounting Software (Future)

---

# A.2 Container Diagram (C4 Level 2)

```text
+-------------------------------------------------------+
|                    React Frontend                     |
|                                                       |
|  Customer UI                                          |
|  Job UI                                               |
|  Invoice UI                                           |
|  Reports UI                                           |
+------------------------+------------------------------+
                         │
                  REST API (HTTPS)
                         │
                         ▼
+-------------------------------------------------------+
|                 Node.js Backend API                   |
|-------------------------------------------------------|
| Authentication                                        |
| Customers                                             |
| Jobs                                                  |
| Designs                                               |
| Attachments                                           |
| Invoices                                              |
| Payments                                              |
| Reports                                               |
| Search                                                |
| Settings                                              |
+------------------------+------------------------------+
                         │
                  Prisma ORM
                         │
                         ▼
+-------------------------------------------------------+
|                    PostgreSQL                         |
+-------------------------------------------------------+

                         │
                         ▼

+-------------------------------------------------------+
|                 File Storage                          |
+-------------------------------------------------------+
```

---

# A.3 Layered Architecture

```text
Presentation Layer
─────────────────────────────
Controllers
Routes
DTOs

        │

Application Layer
─────────────────────────────
Use Cases
Transactions
Workflow Coordination

        │

Domain Layer
─────────────────────────────
Business Rules
Domain Services
Entities
State Machines

        │

Infrastructure Layer
─────────────────────────────
Repositories
Prisma
Storage
Logging
Configuration

        │

PostgreSQL
```

Each layer has a clearly defined responsibility.

Dependencies always point downward.

---

# A.4 Module Dependency Diagram

```text
                    Shared
                       ▲
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼

Customers        Jobs        Designs

        │              │
        │              ▼
        │         Job Items
        │              │
        └──────┬───────┘
               ▼

           Invoices

               │
               ▼

           Payments

               │
               ▼

            Reports

               │
               ▼

             Search
```

### Dependency Rules

Modules communicate only through published interfaces.

Direct repository access across modules is prohibited.

---

# A.5 Bounded Context Map

Business capabilities are grouped into bounded contexts.

```text
Customer Context
────────────────────────────
Customer
Customer Timeline
Customer Summary

           │

           ▼

Production Context
────────────────────────────
Job
Job Item
Design
Attachment

           │

           ▼

Financial Context
────────────────────────────
Invoice
Invoice Item
Payment
Payment Allocation

           │

           ▼

Reporting Context
────────────────────────────
Dashboard
Reports
Search
Analytics

           │

           ▼

Configuration Context
────────────────────────────
Settings
Business Profile
Numbering Rules
Permissions
```

Every business entity belongs to exactly one bounded context.

Ownership is never shared.

---

# A.6 Request Lifecycle Diagram

```text
Browser

   │

Authentication

   │

Authorization

   │

Validation

   │

Controller

   │

Application Service

   │

Domain Service

   │

Repository

   │

Prisma ORM

   │

Database

   │

Response

   │

Browser
```

This flow is mandatory for every protected API request.

---

# A.7 Transaction Boundary

```text
Begin Transaction

      │

Validate Request

      │

Validate Business Rules

      │

Create Records

      │

Update Related Records

      │

Publish Domain Events

      │

Commit Transaction

      │

Success
```

On failure:

```text
Rollback Transaction
```

No partial financial updates are permitted.

---

# A.8 Deployment Diagram

Development Environment

```text
Developer

    │

React Dev Server

    │

Node.js

    │

Local PostgreSQL
```

---

Testing Environment

```text
QA Team

    │

Frontend

    │

Backend

    │

Testing Database
```

---

Production Environment

```text
Users

   │

HTTPS

   │

React Frontend

   │

Node.js API

   │

PostgreSQL

   │

File Storage

   │

Backups
```

Future production architecture may include:

* Reverse Proxy
* Load Balancer
* CDN
* Object Storage
* Background Workers
* Read Replicas

These additions should not require changes to the application architecture.

---

End of Appendix A

# Appendix B – Sequence Diagrams

This appendix documents the runtime interaction between system components for the most important business operations.

Each sequence diagram represents the expected flow of control and defines the responsibilities of each architectural layer.

---

# B.1 Create Customer

## Objective

Register a new customer in the system.

```text
User
 │
 ▼
Customer Screen
 │
 ▼
Customer Controller
 │
 ▼
Authentication Middleware
 │
 ▼
Authorization Middleware
 │
 ▼
Request Validator
 │
 ▼
Customer Application Service
 │
 ▼
Customer Domain Service
 │
 │
 ├── Validate Business Rules
 │
 ├── Check Duplicate Customer
 │
 └── Generate Customer Code
 │
 ▼
Customer Repository
 │
 ▼
Prisma ORM
 │
 ▼
PostgreSQL
 │
 ▼
Commit
 │
 ▼
Audit Logger
 │
 ▼
Return Success Response
```

### Notes

* Customer Code is generated automatically.
* Duplicate customer validation occurs before persistence.
* Audit log is written after successful completion.
* Domain event `CustomerCreated` is published after the transaction commits.

---

# B.2 Create Job

## Objective

Create a production job for an existing customer.

```text
User
 │
 ▼
Job Screen
 │
 ▼
Job Controller
 │
 ▼
Authentication
 │
 ▼
Authorization
 │
 ▼
Validation
 │
 ▼
Job Application Service
 │
 │
 ├── Verify Customer Exists
 │
 ├── Generate Job Number
 │
 └── Begin Transaction
 │
 ▼
Job Domain Service
 │
 ▼
Job Repository
 │
 ▼
Database
 │
 ▼
Commit
 │
 ▼
Publish JobCreated Event
 │
 ▼
Return Response
```

### Notes

* A job cannot exist without a valid customer.
* Job creation does not create Job Items automatically.
* Initial status is always **Draft**.

---

# B.3 Add Job Item

## Objective

Add an embroidery item to an existing job.

```text
User
 │
 ▼
Job Item Screen
 │
 ▼
Controller
 │
 ▼
Validation
 │
 ▼
Application Service
 │
 │
 ├── Verify Job Exists
 │
 ├── Verify Job Is Editable
 │
 └── Validate Quantity
 │
 ▼
Domain Service
 │
 ▼
Repository
 │
 ▼
Database
 │
 ▼
Commit
 │
 ▼
Return Success
```

### Notes

* Job Items inherit the parent Job relationship.
* Items cannot be added to archived jobs.
* Items cannot be added after invoicing (business rule).

---

# B.4 Upload Design

## Objective

Store a reusable embroidery design.

```text
User
 │
 ▼
Upload Screen
 │
 ▼
Controller
 │
 ▼
File Validator
 │
 │
 ├── Extension
 │
 ├── Size
 │
 ├── MIME Type
 │
 └── Virus Scan (Future)
 │
 ▼
Application Service
 │
 ▼
Storage Service
 │
 │
 ├── Save File
 │
 └── Generate Metadata
 │
 ▼
Design Repository
 │
 ▼
Database
 │
 ▼
Commit
 │
 ▼
Return Success
```

### Notes

* File storage and database updates occur within the same logical operation.
* Metadata is stored even if physical storage implementation changes in the future.

---

# B.5 Issue Invoice

## Objective

Generate an invoice from completed Job Items.

```text
User
 │
 ▼
Invoice Screen
 │
 ▼
Invoice Controller
 │
 ▼
Validation
 │
 ▼
Invoice Application Service
 │
 │
 ├── Begin Transaction
 │
 ├── Verify Customer
 │
 ├── Verify Job Items
 │
 ├── Calculate Totals
 │
 ├── Generate Invoice Number
 │
 ▼
Invoice Domain Service
 │
 │
 ├── Create Invoice
 │
 ├── Create Invoice Items
 │
 └── Snapshot Pricing
 │
 ▼
Repositories
 │
 ▼
Database
 │
 ▼
Commit
 │
 ▼
Publish InvoiceIssued Event
 │
 ▼
Audit Log
 │
 ▼
Return Response
```

### Notes

* Only completed and uninvoiced Job Items may be included.
* Invoice totals are calculated by the Domain Layer.
* Invoice Items become immutable after issuance.

---

# B.6 Record Payment

## Objective

Record a customer payment and allocate it to one or more invoices.

```text
User
 │
 ▼
Payment Screen
 │
 ▼
Payment Controller
 │
 ▼
Validation
 │
 ▼
Payment Application Service
 │
 │
 ├── Begin Transaction
 │
 ├── Verify Customer
 │
 ├── Verify Invoices
 │
 ├── Validate Allocation
 │
 ▼
Payment Domain Service
 │
 │
 ├── Create Payment
 │
 ├── Create Allocations
 │
 ├── Update Invoice Balance
 │
 └── Determine Invoice Status
 │
 ▼
Repositories
 │
 ▼
Database
 │
 ▼
Commit
 │
 ▼
Publish PaymentConfirmed Event
 │
 ▼
Audit Log
 │
 ▼
Return Success
```

### Notes

* One payment may satisfy multiple invoices.
* Multiple payments may satisfy one invoice.
* Over-allocation is prohibited.

---

# B.7 Archive Customer

## Objective

Archive a customer while preserving historical records.

```text
User
 │
 ▼
Customer Screen
 │
 ▼
Archive Action
 │
 ▼
Controller
 │
 ▼
Authorization
 │
 ▼
Application Service
 │
 │
 ├── Verify Customer Exists
 │
 ├── Verify Archiving Rules
 │
 ▼
Domain Service
 │
 │
 ├── Set isArchived = true
 │
 ├── Set archivedAt
 │
 └── Set archivedBy
 │
 ▼
Repository
 │
 ▼
Database
 │
 ▼
Commit
 │
 ▼
Audit Log
 │
 ▼
Return Success
```

### Notes

* Customer data remains available for reporting.
* Archived customers are excluded from normal searches by default.
* Related historical Jobs, Invoices, and Payments remain intact.

---

# General Sequence Rules

The following rules apply to all business workflows:

1. Every protected request must pass through Authentication and Authorization.
2. Request validation occurs before business validation.
3. Transactions begin only in the Application Layer.
4. Business rules execute only in the Domain Layer.
5. Repositories are the only components that access the database.
6. Domain events are published only after a successful transaction.
7. Audit records are created only for successful operations unless security logging requires recording failed attempts.
8. Controllers never contain business logic.
9. Every workflow returns a standardized API response.
10. Any failure during a transaction results in a complete rollback.

---

# Sequence Diagram Conventions

All sequence diagrams in EBMS follow these conventions:

* **User** represents a human interacting with the application.
* **Controller** handles HTTP requests and responses.
* **Application Service** coordinates the workflow.
* **Domain Service** enforces business rules.
* **Repository** persists and retrieves data.
* **Prisma ORM** translates repository operations into SQL.
* **Database** is the persistent storage layer.
* **Audit Logger** records significant business actions.
* **Domain Events** are emitted only after successful transaction completion.

These conventions ensure every workflow remains consistent across the entire system.

---

End of Appendix B
# Appendix C – Architecture Decision Records (ADR)

## Purpose

Architecture Decision Records (ADRs) capture significant architectural decisions made during the design of the Embroidery Business Management System (EBMS).

Each ADR documents:

* The problem or context.
* The decision that was made.
* Alternative approaches that were considered.
* The consequences of the decision.

ADRs provide historical context and help maintain architectural consistency as the project evolves.

---

# ADR-001 — Modular Monolith Architecture

## Status

**Accepted**

---

## Context

The application requires clear modularity, maintainability, and future scalability while keeping deployment and operations simple.

Possible architectural styles included:

* Traditional Layered Monolith
* Modular Monolith
* Microservices
* Serverless

---

## Decision

EBMS will be implemented as a **Modular Monolith**.

Business capabilities will be separated into independent modules while remaining within a single deployable application.

---

## Alternatives Considered

### Traditional Monolith

Pros

* Very simple

Cons

* Poor separation of concerns
* Difficult long-term maintenance
* High coupling

---

### Microservices

Pros

* Independent deployment
* Excellent scalability

Cons

* Operational complexity
* Distributed transactions
* Service discovery
* Higher infrastructure cost

---

## Consequences

Positive

* Simple deployment
* Clear boundaries
* Easier testing
* Excellent developer productivity
* Easy AI-assisted code generation

Negative

* Entire application deployed together
* Shared database

---

# ADR-002 — UUID Primary Keys

## Status

**Accepted**

---

## Context

The system requires globally unique identifiers suitable for future integrations and possible distributed deployments.

---

## Decision

All primary entities use UUIDs.

Business-facing numbers remain separate.

Example

Customer ID

```
550e8400-e29b-41d4-a716-446655440000
```

Customer Code

```
CUS-000123
```

---

## Alternatives Considered

### Auto Increment Integer

Pros

* Small indexes
* Fast

Cons

* Predictable
* Difficult to merge across systems
* Less suitable for distributed environments

---

## Consequences

Positive

* Globally unique
* Future-proof
* API friendly

Negative

* Larger indexes
* Less readable

---

# ADR-003 — Soft Delete Strategy

## Status

**Accepted**

---

## Context

Business records frequently need to be hidden without losing historical information.

Financial reporting requires preservation of historical relationships.

---

## Decision

Operational entities use Soft Delete.

Fields:

* isArchived
* archivedAt
* archivedBy

Hard deletion is reserved for exceptional administrative or legal scenarios.

---

## Alternatives Considered

### Hard Delete

Pros

* Simpler
* Smaller database

Cons

* Permanent data loss
* Broken historical references
* Audit limitations

---

## Consequences

Positive

* Historical reporting
* Safer operations
* Better auditability

Negative

* Larger database
* Additional query filtering

---

# ADR-004 — Invoice Snapshot Architecture

## Status

**Accepted**

---

## Context

Invoice data must remain historically accurate even if related jobs or pricing change later.

---

## Decision

Invoices contain immutable Invoice Items that capture a snapshot of the relevant Job Item data at the time the invoice is issued.

Future edits to jobs do not modify issued invoices.

---

## Alternatives Considered

### Reference Job Items Directly

Pros

* Less duplicated data

Cons

* Historical invoices could change when operational data changes

---

## Consequences

Positive

* Financial integrity
* Reliable reporting
* Audit compliance

Negative

* Intentional data duplication

---

# ADR-005 — Payment Allocation Model

## Status

**Accepted**

---

## Context

Customers may:

* Pay multiple invoices together.
* Pay invoices partially.
* Pay the same invoice over multiple transactions.

---

## Decision

Payments are connected to invoices through a Payment Allocation entity.

```
Payment
     │
     ▼
Payment Allocation
     │
     ▼
Invoice
```

---

## Alternatives Considered

### Payment → Invoice (Direct)

Pros

* Simpler

Cons

* Cannot support partial allocations
* Cannot support many-to-many relationships

---

## Consequences

Positive

* Flexible payment workflows
* Accurate outstanding balances
* Industry-standard accounting model

Negative

* Additional table
* Slightly more complex queries

---

# ADR-006 — Repository Pattern

## Status

**Accepted**

---

## Context

Business logic should remain independent of the persistence technology.

---

## Decision

Repositories provide the only mechanism for reading and writing persistent data.

Business services depend on repository interfaces rather than Prisma directly.

---

## Alternatives Considered

### Direct ORM Access

Pros

* Less code

Cons

* Tight coupling
* Difficult testing
* Persistence logic scattered throughout the application

---

## Consequences

Positive

* Better separation of concerns
* Easier unit testing
* Easier future migration

Negative

* Additional abstraction layer

---

# ADR-007 — Domain-Oriented Module Structure

## Status

**Accepted**

---

## Context

Large applications become difficult to maintain when organized purely by technical layers.

---

## Decision

The project is organized around business domains.

Examples:

* Customers
* Jobs
* Designs
* Invoices
* Payments

Each module owns its controllers, services, repositories, validators, DTOs, and tests.

---

## Alternatives Considered

### Global Folder Structure

```
controllers/
services/
repositories/
```

Pros

* Familiar for small projects

Cons

* Poor scalability
* Weak ownership
* High coupling

---

## Consequences

Positive

* Strong module ownership
* Better maintainability
* Easier onboarding
* Clear business boundaries

Negative

* Slight duplication of folder structure across modules

---

# ADR Governance

Architecture Decisions are permanent project records.

Future architectural changes must:

1. Define the problem or motivation.
2. Evaluate alternatives.
3. Document the chosen solution.
4. Describe expected consequences.
5. Receive architectural review before implementation.

Existing ADRs should never be silently modified. If a previous decision becomes obsolete, a new ADR should supersede it while preserving the historical record.

---

# ADR Lifecycle

```
Proposed
     │
     ▼
Under Review
     │
     ▼
Accepted
     │
     ├──────────────► Superseded
     │
     └──────────────► Deprecated
```

Every ADR should include a unique identifier and remain accessible for the lifetime of the project.

---

# End of Appendix C
