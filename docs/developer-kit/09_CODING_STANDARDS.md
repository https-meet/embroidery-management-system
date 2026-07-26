# 09_CODING_STANDARDS.md

**Project:** Embroidery Business Management System (EBMS)

**Developer Kit Version:** 1.0

**Document Version:** 1.0

**Status:** Approved

---

# 1. Purpose

This document defines the coding standards for the Embroidery Business Management System (EBMS).

Its purpose is to ensure that all code written by developers or AI assistants is:

* Consistent
* Readable
* Maintainable
* Testable
* Secure
* Easy to review

These standards apply to all backend and frontend code.

---

# 2. General Principles

## CS-001 Readability First

Code is written for humans first and computers second.

Prefer clarity over cleverness.

---

## CS-002 Consistency

The same problem should be solved in the same way throughout the project.

---

## CS-003 Simplicity

Prefer the simplest solution that satisfies the business requirement.

Avoid unnecessary abstraction.

---

## CS-004 Single Responsibility

Each module, class, and function should have one primary responsibility.

---

## CS-005 Explicitness

Avoid hidden behavior.

Dependencies and business logic should be explicit.

---

# 3. Naming Conventions

## Variables

Use **camelCase**.

Examples:

```ts
customerName

invoiceTotal

paymentAmount
```

---

## Functions

Use **camelCase**.

Function names should describe actions.

Examples:

```ts
createCustomer()

issueInvoice()

confirmPayment()
```

---

## Classes

Use **PascalCase**.

Examples:

```ts
CustomerService

InvoiceRepository

PaymentValidator
```

---

## React Components

Use **PascalCase**.

Examples:

```tsx
CustomerTable

InvoiceForm

DashboardCard
```

---

## Files

Examples:

```text
customer.service.ts

customer.repository.ts

customer.validator.ts

customer.routes.ts
```

React:

```text
CustomerForm.tsx

CustomerTable.tsx
```

---

## Constants

Use **UPPER_SNAKE_CASE**.

Example:

```ts
MAX_UPLOAD_SIZE

DEFAULT_PAGE_SIZE
```

---

# 4. Folder Structure

## Monorepo Root

```text
apps/
├── backend/
│   ├── src/
│   │   ├── modules/         — Feature modules (one per business domain)
│   │   ├── shared/          — Backend-only utilities (middleware, guards, pipes)
│   │   ├── middleware/      — Express middleware
│   │   ├── config/          — Application configuration and env loading
│   │   └── main.ts          — Application entry point
│   ├── prisma/          — Prisma schema and migration files
│   └── package.json
└── frontend/
    ├── src/
    │   ├── features/        — Feature-based React modules (mirrors backend domains)
    │   ├── components/      — Shared UI components
    │   ├── hooks/           — Shared custom React hooks
    │   ├── lib/             — API client, utility functions
    │   └── main.tsx         — Application entry point
    └── package.json

packages/
├── shared/
│   ├── src/
│   │   ├── types/           — Shared TypeScript interfaces and DTOs
│   │   └── constants/       — Shared constants (status enums, error codes)
│   └── package.json
└── config/
    ├── eslint/          — Shared ESLint configuration
    ├── prettier/        — Shared Prettier configuration
    ├── tsconfig/        — Shared TypeScript base configurations
    └── package.json
```

## Backend Module Structure

Each feature module under `apps/backend/src/modules/` follows this internal structure:

```text
customer/

├── controller/
├── service/
├── repository/
├── validator/
├── dto/
├── routes/
├── tests/
└── index.ts
```

Each module owns its implementation. No business logic is shared across module boundaries except through public module interfaces.

---

# 5. Function Design

Functions should:

* Perform one task.
* Have descriptive names.
* Minimize side effects.
* Return predictable results.

Avoid deeply nested logic.

Prefer early returns.

Example:

```ts
if (!customer) {
    throw new NotFoundError();
}
```

instead of multiple nested `if` statements.

---

# 6. Error Handling

Never silently ignore errors.

Use domain-specific exceptions.

Examples:

```ts
ValidationError

BusinessRuleError

NotFoundError

ConflictError
```

Do not throw generic `Error` objects for business scenarios.

## API Error Code Convention

Error codes returned in API responses must follow `SCREAMING_SNAKE_CASE`.

Format: `{ENTITY}_{REASON}`

Examples:

```ts
CUSTOMER_NOT_FOUND
INVOICE_ALREADY_ISSUED
PAYMENT_ALLOCATION_EXCEEDS_BALANCE
JOB_ITEM_NOT_COMPLETED
JOB_MUST_CONTAIN_ITEMS
```

Error codes are part of the public API contract. They must not be changed without a Developer Kit version increment.

---

# 7. Logging

Log meaningful business events.

Examples:

* Customer created.
* Invoice issued.
* Payment confirmed.

Do not log:

* Passwords
* Authentication tokens
* Sensitive customer information

---

# 8. Validation

Validation occurs at multiple layers:

1. Request validation
2. Business validation
3. Database constraints

Never rely on only one layer.

---

# 9. Database Access

Repositories are the only components allowed to communicate directly with Prisma.

Services must not execute raw database queries.

---

# 10. API Design

Controllers should:

* Validate requests.
* Delegate business logic to services.
* Return standardized responses.

Controllers should not contain business rules.

---

# 11. Frontend Standards

React components should:

* Be reusable.
* Be focused on presentation.
* Keep business logic outside UI components where practical.

Complex state management belongs in hooks or dedicated services.

---

# 12. Comments

Write comments only when they explain **why**, not **what**.

Good:

```ts
// Preserve historical invoice totals after issuance.
```

Avoid:

```ts
// Increment i.
```

Code should be self-explanatory whenever possible.

---

# 13. Testing

Every business rule should have automated tests.

Minimum expectations:

* Unit tests for services.
* Integration tests for repositories.
* API tests for endpoints.
* End-to-end tests for critical workflows.

---

# 14. Git Commit Messages

Follow Conventional Commits.

Examples:

```text
feat(customer): add customer creation

fix(invoice): prevent duplicate invoice numbers

refactor(payment): simplify allocation logic

test(job): add completion workflow tests

docs(api): update payment endpoints
```

---

# 15. Security

Never trust client input.

Always:

* Validate input.
* Authorize actions.
* Sanitize where necessary.
* Protect sensitive data.

---

# 16. Code Review Checklist

Before merging code, verify:

* Business rules implemented correctly.
* Tests pass.
* No duplicated logic.
* Consistent naming.
* Proper error handling.
* Logging included where appropriate.
* Security considerations addressed.

---

# 17. Definition of Done

A feature is complete only when:

* Business requirements are satisfied.
* Tests pass.
* Code review completed.
* Documentation updated (if required).
* No known critical issues remain.

---

# End of Document
