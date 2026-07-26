# 03_FEATURE_SPECIFICATIONS/02_CUSTOMERS.md

**Project Name:** Embroidery Business Management System (EBMS)

**Module:** Customer Management

**Developer Kit Version:** 1.0

**Version:** 1.0

**Status:** Approved

---

# 1. Purpose

The Customer module manages all business customers and serves as the starting point for every business transaction.

Every Job, Invoice, and Payment belongs to a Customer.

The Customer module acts as the central workspace for understanding the relationship with each customer.

---

# 2. Objectives

The module must allow users to:

* Create new customers.
* View customer information.
* Update customer information.
* Archive customers.
* Search customers.
* View customer history.
* View outstanding balances.
* View completed work.
* View invoices.
* View payments.

---

# 3. User Stories

### US-001

As a business owner,

I want to create a customer,

so that I can record embroidery work.

---

### US-002

As a business owner,

I want to search customers quickly,

so I don't waste time looking through notebooks.

---

### US-003

As a business owner,

I want to see all work related to one customer,

so I understand our complete business history.

---

### US-004

As a business owner,

I want to archive inactive customers,

without losing historical records.

---

# 4. Customer Information

Each customer stores:

* Customer Code
* Customer Type
* Business Name / Customer Name
* Contact Person (optional)
* Mobile Number
* Alternate Mobile Number (optional)
* Email (optional)
* Address (optional)
* Notes (optional)
* Active Status
* Created Date
* Updated Date

---

# 5. Customer Types

Version 1 supports:

* Individual
* Company

This affects business reporting only.

The workflow remains the same.

---

# 6. Customer Workspace

Opening a customer should display a complete workspace instead of only basic information.

The workspace should include:

## Profile

Customer details.

---

## Financial Summary

* Outstanding Balance
* Total Revenue
* Total Paid
* Last Payment

---

## Job Summary

* Total Jobs
* Active Jobs
* Completed Jobs

---

## Recent Jobs

Latest embroidery work.

---

## Recent Invoices

Latest invoices.

---

## Recent Payments

Latest payments.

---

## Timeline

Chronological activity:

* Customer Created
* Job Created
* Job Completed
* Invoice Generated
* Payment Recorded

---

# 7. Validation Rules

Customer Name

Required.

---

Mobile Number

Optional.

If provided,

must follow a valid mobile number format.

---

Customer Type

Required.

---

Duplicate Detection

If another active customer has the same name and mobile number,

the system should warn the user before saving.

---

# 8. Business Rules

* Customers cannot be permanently deleted.
* Archived customers remain available in historical records.
* Existing Jobs, Invoices, and Payments must never lose their customer relationship.
* Customer Codes are generated automatically by the system.

---

# 9. Search

Users should be able to search customers using:

* Customer Code
* Customer Name
* Company Name
* Mobile Number

Search should be fast and case-insensitive.

---

# 10. Future Enhancements

Version 2 may introduce:

* Multiple Contact Persons
* GST Information
* Credit Limits
* Customer Categories
* Customer Documents
* Communication History

These are intentionally excluded from Version 1.

---

# 11. Acceptance Criteria

The Customer module is complete when the user can:

* Create a customer successfully.
* Edit customer details.
* Archive a customer.
* Search customers quickly.
* Open a customer workspace.
* View related Jobs, Invoices, and Payments.
* Prevent accidental duplicate customer creation.

---

# 12. Implementation Notes

This module becomes the foundation for all remaining modules.

No other module should bypass the Customer relationship.

Future AI implementations must follow this specification without introducing additional customer fields or workflows unless the documentation is officially updated.
