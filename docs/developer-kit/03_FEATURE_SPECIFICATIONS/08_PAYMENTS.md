# 03_FEATURE_SPECIFICATIONS/08_PAYMENTS.md

**Project Name:** Embroidery Business Management System (EBMS)

**Module:** Payment Management

**Developer Kit Version:** 1.0

**Version:** 1.0

**Status:** Approved

---

# 1. Purpose

The Payment module records money received from customers and allocates those payments to one or more invoices.

Payments complete the financial lifecycle of the business and provide accurate outstanding balance calculations.

Payments never modify invoice values. They only reduce outstanding balances through payment allocations.

---

# 2. Business Objectives

The module must allow users to:

* Record customer payments.
* Allocate payments across multiple invoices.
* Support partial payments.
* Track outstanding balances.
* Maintain a complete payment history.
* Generate payment reports.

---

# 3. User Stories

### US-001

As a business owner,

I want to record payments from customers,

so outstanding balances remain accurate.

---

### US-002

As a business owner,

I want one payment to settle multiple invoices,

so company customers can make consolidated payments.

---

### US-003

As a business owner,

I want to accept partial payments,

so customers can pay in installments.

---

### US-004

As a business owner,

I want to see the complete payment history of a customer,

so I can answer payment-related questions quickly.

---

# 4. Functional Requirements

The system shall allow users to:

* Record payments.
* Allocate payment amounts to invoices.
* Edit payments before final confirmation.
* View payment history.
* Search payments.
* Print payment receipts (optional).
* Archive payment records (administrative use only).

---

# 5. Payment Information

Each Payment stores:

* Payment Number
* Customer
* Payment Date
* Payment Method (required)
  * Cash
  * UPI
  * Bank Transfer
  * Cheque
* Reference Number (optional, e.g., cheque number, UTR, transaction ID)
* Total Amount Received
* Notes (optional)
* Created Date
* Updated Date

Example Payment Number:

PAY-2026-000078

---

# 6. Payment Allocation

Each Payment contains one or more Payment Allocations.

Each Allocation stores:

* Invoice
* Allocated Amount

The total of all allocations must always equal the Payment Amount.

---

# 7. Payment Lifecycle

Allowed States:

Draft

↓

Confirmed

Rules:

* Every Payment begins as Draft.
* Draft Payments may be edited.
* Confirmed Payments become read-only.
* Confirming a Payment immediately updates Invoice balances.

---

# 8. Financial Rules

* Payments never change Invoice totals.
* Payments only reduce outstanding balances.
* One Payment may pay multiple Invoices.
* One Invoice may receive multiple Payments.
* Allocated amounts cannot exceed an Invoice's remaining balance.
* Total allocations cannot exceed the Payment Amount.
* Negative payments are not allowed.

---

# 9. Business Rules

* Payments belong to exactly one Customer.
* Payments may only be allocated to that Customer's invoices.
* Confirmed payments cannot be edited.
* Payment Numbers must be unique.
* Historical payment records remain permanently available.

---

# 10. Validation Rules

Customer

Required.

---

Payment Amount

Required.

Must be greater than zero.

---

Payment Date

Required.

---

Payment Method

Required.

---

Allocation Validation

The system must prevent over-allocation.

The total allocated amount must equal the payment amount before confirmation.

---

# 11. Payment Workspace

The Payment screen should contain:

## Header

* Payment Number
* Customer
* Payment Date
* Status

---

## Payment Details

* Amount Received
* Payment Method
* Reference Number
* Notes

---

## Allocation Table

Columns:

* Invoice Number
* Invoice Total
* Outstanding Balance
* Allocation Amount

The system should display the remaining unallocated amount while the user is allocating payments.

---

## Timeline

Chronological events:

* Payment Created
* Allocation Updated
* Payment Confirmed

---

# 12. Permissions

Business Owner:

* Full Payment management.

Future Employee:

* Record Draft Payments.
* Confirm Payments if permitted.
* View Payments.

Future Administrator:

* Full access.

---

# 13. Error Cases

Examples:

* Allocation exceeds Invoice balance.
* Payment amount is zero.
* Customer not selected.
* Invoice belongs to another Customer.
* Attempt to modify a Confirmed Payment.

Error messages must clearly explain the problem.

---

# 14. Acceptance Criteria

The module is complete when users can:

* Record Payments.
* Allocate Payments across multiple Invoices.
* Accept partial Payments.
* Prevent over-allocation.
* Search Payment history.
* Calculate Invoice balances automatically.

---

# 15. Future Enhancements

Potential Version 2 features:

* Advance payments.
* Customer credit balance.
* Payment refunds.
* Online payment gateway integration.
* Automatic bank reconciliation.
* Multiple currencies.

These features are intentionally excluded from Version 1.

---

# 16. Dependencies

Depends on:

* Customers
* Invoices

Required by:

* Dashboard
* Reports

---

# 17. API Requirements

The backend should provide endpoints to:

* Create Draft Payment
* Confirm Payment
* Get Payment Details
* Search Payments
* List Customer Payments
* Allocate Payment
* Get Outstanding Invoices

---

# 18. Database Impact

Primary Entity:

Payment

Supporting Entity:

PaymentAllocation

Relationships:

* One Customer → Many Payments
* One Payment → Many Payment Allocations
* One Invoice → Many Payment Allocations

PaymentAllocation forms the many-to-many relationship between Payments and Invoices.

---

# 19. Notes

Payments represent the receipt of money from customers.

PaymentAllocation exists to provide maximum flexibility while preserving financial accuracy.

This design supports consolidated payments, installment payments, future accounting integrations, and detailed financial reporting without requiring database redesign.
