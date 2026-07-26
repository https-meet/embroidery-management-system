# 03_FEATURE_SPECIFICATIONS/07_INVOICES.md

**Project Name:** Embroidery Business Management System (EBMS)

**Module:** Invoice Management

**Developer Kit Version:** 1.0

**Version:** 1.0

**Status:** Approved

---

# 1. Purpose

The Invoice module converts completed embroidery work into official financial documents.

An Invoice represents the amount owed by a Customer for completed Job Items.

Invoices provide the basis for payment collection, reporting, and future accounting integration.

Once an Invoice is issued, it becomes an immutable financial record.

---

# 2. Business Objectives

The module must allow users to:

* Generate invoices from completed Job Items.
* Combine multiple Jobs into a single invoice.
* Track payment status.
* Print or download invoices.
* View invoice history.
* Maintain accurate financial records.

---

# 3. User Stories

### US-001

As a business owner,

I want to create one invoice containing work from multiple Jobs,

so company customers receive consolidated billing.

---

### US-002

As a business owner,

I want invoices to remain unchanged after being issued,

so financial records remain accurate.

---

### US-003

As a business owner,

I want to know whether an invoice is unpaid, partially paid, or fully paid,

so I can follow up with customers.

---

### US-004

As a business owner,

I want to print invoices in a professional format,

so they can be shared with customers.

---

# 4. Functional Requirements

The system shall allow users to:

* Create Draft invoices.
* Select completed Job Items for billing.
* Generate invoice totals automatically.
* Apply optional discounts (Percentage or Fixed Amount).
* Issue invoices.
* Print invoices.
* Download invoices as PDF.
* Record invoice notes.
* View invoice history.

Invoices may contain Job Items from multiple Jobs, provided all Jobs belong to the same Customer.

Note: The technical implementation of PDF generation (library, rendering approach, template design) will be evaluated and decided at the start of Phase 5 development.

---

# 5. Invoice Information

Each Invoice stores:

* Invoice Number
* Customer
* Invoice Date
* Due Date (optional)
* Status
* Notes
* Subtotal
* Discount Type (optional): PERCENTAGE or FIXED_AMOUNT
* Discount Value (optional): The percentage (0–100) or fixed monetary amount
* Discount Amount (calculated and frozen at issuance): The monetary value of the discount
* Grand Total (Subtotal − Discount Amount)
* Total Paid
* Outstanding Balance
* Created Date
* Updated Date

Invoice numbers are generated automatically.

Example:

INV-2026-000145

---

# 6. Invoice Items

Each Invoice contains one or more Invoice Items.

Each Invoice Item stores:

* Description
* Source Job
* Source Job Item
* Quantity
* Rate
* Amount

Invoice Items are snapshots of Job Items at the time the invoice is issued.

Future changes to Job Items must never modify existing Invoice Items.

---

# 7. Invoice Lifecycle

Allowed states:

Draft

↓

Issued

↓

Partially Paid

↓

Paid

CANCELLED (from DRAFT only)

Rules:

* Every Invoice starts as Draft.
* Only Draft invoices may be edited.
* Issued invoices become read-only.
* Paid invoices are permanently locked.
* Only Draft invoices may be cancelled.
* Issued, Partially Paid, and Paid invoices cannot be cancelled in Version 1.
* A CANCELLED invoice is not deleted. It remains in the system permanently for audit purposes.
* The CANCELLED status is a final state. No further transitions are permitted.
* A cancelled invoice number is retired and must never be reused within the same calendar year.

---

# 8. Financial Rules

* Invoice totals are calculated by the system.
* Invoice Items determine the Invoice subtotal.
* Negative invoice totals are not allowed.
* Only completed and uninvoiced Job Items may be added.
* A Job Item cannot appear in more than one active Invoice.
* Payments never modify Invoice totals.
* Discounts are optional. When applied:
  * Discount Type must be PERCENTAGE or FIXED_AMOUNT.
  * Percentage: Discount Amount = ROUND(Subtotal × Discount Value / 100, 2)
  * Fixed Amount: Discount Amount = Discount Value (must not exceed Subtotal)
  * Grand Total = Subtotal − Discount Amount
  * Grand Total must always be greater than zero.
  * Discount Amount is calculated at issuance and stored permanently. It is never recalculated.
* Taxes are reserved for future versions.

---

# 9. Business Rules

* All billed Job Items must belong to the same Customer.
* One Invoice may contain Job Items from multiple Jobs.
* Archived Jobs remain visible through historical invoices.
* Invoice Numbers must be unique.
* Historical invoices must remain searchable.
* Printed invoices always reflect the stored snapshot.

---

# 10. Validation Rules

Customer

Required.

---

Invoice Items

Minimum one required.

---

Invoice Date

Required.

---

Grand Total

Must be greater than zero.

---

Duplicate Billing

The system must prevent already invoiced Job Items from being selected.

---

# 11. Invoice Workspace

The Invoice screen should contain:

## Header

* Invoice Number
* Customer
* Status
* Dates

---

## Invoice Items Table

Columns:

* Job Number
* Description
* Quantity
* Rate
* Amount

---

## Totals

* Subtotal
* Discount
* Grand Total
* Paid Amount
* Outstanding Balance

---

## Payment Summary

Displays all payments allocated to this Invoice.

---

## Timeline

Chronological events:

* Draft Created
* Invoice Issued
* Payment Received
* Invoice Paid

---

# 12. Permissions

Business Owner:

* Full Invoice management.

Future Employee:

* Create Draft invoices.
* Issue invoices if permitted.
* View invoices.

Future Administrator:

* Full access.

---

# 13. Error Cases

Examples:

* No Job Items selected.
* Job Items belong to different Customers.
* Attempt to invoice an already billed Job Item.
* Attempt to edit an Issued Invoice.
* Invoice not found.

Business errors should always be displayed in user-friendly language.

---

# 14. Acceptance Criteria

The module is complete when users can:

* Create Draft invoices.
* Select completed Job Items.
* Generate automatic totals.
* Issue invoices.
* Print invoices.
* Download PDF invoices.
* Track payment status.
* Prevent duplicate billing.

---

# 15. Future Enhancements

Potential Version 2 features:

* GST support.
* Credit Notes.
* Debit Notes.
* Invoice revisions.
* Recurring invoices.
* Digital signatures.
* Email delivery.

These features are intentionally excluded from Version 1.

---

# 16. Dependencies

Depends on:

* Customers
* Jobs
* Job Items

Required by:

* Payments
* Reports
* Dashboard

---

# 17. API Requirements

The backend should provide endpoints to:

* Create Draft Invoice
* Add Job Items
* Issue Invoice
* Get Invoice Details
* List Invoices
* Print Invoice
* Download Invoice PDF
* Search Invoices

---

# 18. Database Impact

Primary Entity:

Invoice

Supporting Entity:

InvoiceItem

Relationships:

* One Customer → Many Invoices
* One Invoice → Many Invoice Items
* One Invoice Item → One Source Job Item
* One Invoice → Many Payment Allocations

---

# 19. Notes

Invoices represent official financial records.

Operational changes made after an Invoice is issued must never alter historical invoice data.

Invoice Items exist to preserve a permanent financial snapshot, ensuring consistency for reporting, auditing, and future accounting integrations.
