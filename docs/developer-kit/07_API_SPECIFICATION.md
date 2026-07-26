# 07_API_SPECIFICATION.md

**Project:** Embroidery Business Management System (EBMS)

**Developer Kit Version:** 1.0

**Document Version:** 1.0

**Status:** Approved

---

# 1. Purpose

This document defines the external REST API for the Embroidery Business Management System (EBMS).

The API represents business operations rather than database operations.

Its objectives are:

* Expose business capabilities
* Maintain consistency
* Protect business rules
* Support frontend applications
* Support future integrations

---

# 2. API Design Principles

## API-001 Business-Oriented

Endpoints represent business actions.

Example:

Correct

```
POST /jobs
```

Avoid

```
POST /job_items
```

unless job items are intentionally managed separately.

---

## API-002 Resource Based

Resources represent business entities.

Examples

```
/customers

/jobs

/designs

/invoices

/payments
```

---

## API-003 Stateless

Each request contains all information required for processing.

No server-side session state is required for API requests.

---

## API-004 Predictable

Similar operations follow consistent conventions.

---

## API-005 Versioned

The initial API version is:

```
/api/v1/
```

Future breaking changes require a new version.

---

# 3. Authentication

All protected endpoints require a valid JWT Access Token.

Header format:

```
Authorization: Bearer <accessToken>
```

## Authentication Endpoints

| Method | Endpoint        | Purpose                                        |
| ------ | --------------- | ---------------------------------------------- |
| POST   | /auth/login     | Authenticate with email/username and password  |
| POST   | /auth/refresh   | Exchange refresh token for new access token    |
| POST   | /auth/logout    | Invalidate refresh token                       |

**POST /auth/login**

```json
// Request
{ "email": "user@example.com", "password": "secret" }

// Response
{ "success": true, "data": { "accessToken": "...", "refreshToken": "...", "user": { } } }
```

**POST /auth/refresh**

```json
// Request
{ "refreshToken": "..." }

// Response
{ "success": true, "data": { "accessToken": "...", "refreshToken": "..." } }
```

**POST /auth/logout**

Invalidates the supplied refresh token. Returns 204 No Content.

Future authentication methods may include:

* Google Sign-In
* Microsoft Entra ID
* Two-Factor Authentication

---

# 4. Standard Response Format

## Successful Response

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully."
}
```

## Business / Domain Error Response

Used for: entity not found, business rule violations, invalid state transitions, authorization failures.

```json
{
  "success": false,
  "error": {
    "code": "INVOICE_ALREADY_ISSUED",
    "message": "This invoice has already been issued and cannot be edited."
  }
}
```

Error codes use `SCREAMING_SNAKE_CASE`. They are part of the API contract and must not change without a version increment.

## Validation Error Response

Used for: missing required fields, invalid data types, format violations.

```json
{
  "success": false,
  "errors": [
    { "field": "customerName", "message": "Customer name is required." },
    { "field": "paymentAmount", "message": "Payment amount must be greater than zero." }
  ]
}
```

---

# 5. HTTP Status Codes

| Status | Meaning                 |
| ------ | ----------------------- |
| 200    | Success                 |
| 201    | Created                 |
| 204    | No Content              |
| 400    | Validation Error        |
| 401    | Unauthorized            |
| 403    | Forbidden               |
| 404    | Not Found               |
| 409    | Conflict                |
| 422    | Business Rule Violation |
| 500    | Internal Server Error   |

---

# 6. Customer API

| Method | Endpoint        | Purpose          |
| ------ | --------------- | ---------------- |
| POST   | /customers      | Create Customer  |
| GET    | /customers      | Search Customers |
| GET    | /customers/{id} | Get Customer     |
| PUT    | /customers/{id} | Update Customer  |
| DELETE | /customers/{id} | Archive Customer |

---

# 7. Job API

| Method | Endpoint            | Purpose      |
| ------ | ------------------- | ------------ |
| POST   | /jobs               | Create Job   |
| GET    | /jobs               | Search Jobs  |
| GET    | /jobs/{id}          | View Job     |
| PUT    | /jobs/{id}          | Update Job   |
| POST   | /jobs/{id}/complete | Complete Job |
| POST   | /jobs/{id}/deliver  | Deliver Job  |

---

# 8. Design API

| Method | Endpoint      | Purpose        |
| ------ | ------------- | -------------- |
| POST   | /designs      | Create Design  |
| GET    | /designs      | Search Designs |
| GET    | /designs/{id} | View Design    |
| PUT    | /designs/{id} | Update Design  |
| DELETE | /designs/{id} | Archive Design |

---

# 9. Invoice API

| Method | Endpoint              | Purpose                             |
| ------ | --------------------- | ----------------------------------- |
| POST   | /invoices             | Create Draft Invoice                |
| GET    | /invoices             | Search Invoices                     |
| GET    | /invoices/{id}        | View Invoice                        |
| PUT    | /invoices/{id}        | Update Draft Invoice                |
| POST   | /invoices/{id}/issue  | Issue Invoice (locks it)            |
| POST   | /invoices/{id}/cancel | Cancel Draft Invoice                |

Cancellation Rules:

* Only invoices in DRAFT status may be cancelled.
* Issued, Partially Paid, and Paid invoices cannot be cancelled in Version 1.
* A CANCELLED invoice remains in the system permanently for audit purposes.
* The invoice number is retired and must never be reused.

Issued invoices are immutable. No endpoint may modify invoice totals or items after issuance.

---

# 10. Payment API

| Method | Endpoint               | Purpose         |
| ------ | ---------------------- | --------------- |
| POST   | /payments              | Record Payment  |
| GET    | /payments              | Search Payments |
| GET    | /payments/{id}         | View Payment    |
| POST   | /payments/{id}/confirm | Confirm Payment |

Confirmed payments become immutable.

---

# 11. Search and Filtering

Collection endpoints support:

* Pagination
* Sorting
* Filtering
* Keyword search

Example:

```
GET /customers?page=1&pageSize=25&sort=name&search=Textile
```

---

# 12. Validation

The API validates:

* Request format
* Required fields
* Data types
* Authorization
* Business rules

Validation failures return descriptive error messages.

---

# 13. Idempotency

Operations should be idempotent where appropriate.

Examples:

* GET requests
* PUT updates
* DELETE (Archive) operations

Business actions such as issuing invoices or confirming payments are intentionally non-idempotent unless protected by explicit idempotency keys.

---

# 14. Rate Limiting

The API should support configurable rate limiting to protect against abuse.

Policies may vary by:

* Authenticated users
* Public endpoints
* Administrative operations

---

# 15. Security Considerations

The API must:

* Enforce authentication
* Enforce authorization
* Validate input
* Sanitize output where appropriate
* Avoid exposing internal implementation details
* Log security-relevant events

---

# 16. Future API Capabilities

The API design should allow future additions such as:

* Webhooks
* Customer Portal
* Mobile Applications
* External ERP Integration
* Accounting Integration
* Reporting API

---

# 17. API Governance

All new endpoints must:

* Follow REST conventions
* Respect business rules
* Return consistent response formats
* Be documented before implementation
* Include automated tests

Breaking API changes require a new API version.

---

# End of Document
