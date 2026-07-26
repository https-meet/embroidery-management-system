# 03_FEATURE_SPECIFICATIONS/04_JOB_ITEMS.md

**Project Name:** Embroidery Business Management System (EBMS)

**Module:** Job Item Management

**Developer Kit Version:** 1.0

**Version:** 1.0

**Status:** Approved

---

# 1. Purpose

The Job Item module represents each individual embroidery operation within a Job.

A Job acts as a container, while Job Items contain the actual work that is performed, priced, tracked, and ultimately invoiced.

This module is the primary source of billing data for the system.

---

# 2. Business Objectives

The module must allow users to:

* Add multiple embroidery operations to a Job.
* Track production progress for each operation.
* Store pricing information.
* Record embroidery specifications.
* Generate accurate invoice items.
* Preserve historical production data.

---

# 3. User Stories

### US-001

As a business owner,

I want to divide a Job into multiple embroidery tasks,

so different work can be tracked independently.

---

### US-002

As a business owner,

I want each embroidery task to have its own quantity and rate,

so billing remains accurate.

---

### US-003

As a business owner,

I want to know which operations are completed,

so invoices are generated correctly.

---

### US-004

As a business owner,

I want to reuse previous embroidery specifications,

so repetitive data entry is reduced.

---

# 4. Functional Requirements

The system shall allow users to:

* Create Job Items.
* Edit Job Items before invoicing.
* Archive Job Items.
* Track production status.
* Attach designs to Job Items.
* Calculate line totals automatically.
* Display Job Item history.

---

# 5. Job Item Information

Each Job Item stores:

* Job Item Number
* Parent Job
* Embroidery Position
* Design
* Quantity
* Rate
* Line Total (calculated)
* Thread Color
* Dimensions (optional)
* Remarks (optional)
* Production Status
* Created Date
* Updated Date

The Line Total is calculated by the system:

**Line Total = Quantity × Rate**

Users cannot edit the calculated total directly.

---

# 6. Production Status Lifecycle

Each Job Item has its own status.

Allowed values:

* Draft
* Pending Production
* In Production
* Completed
* Cancelled

Rules:

* New Job Items begin in Draft.
* Completed items cannot return to Draft.
* Cancelled items are excluded from billing.
* Only Completed items are eligible for invoicing.

---

# 7. Embroidery Specifications

Each Job Item may include:

* Embroidery Position (Collar, Pocket, Sleeve, Cap, Front, Back, etc.)
* Thread Color
* Design Reference
* Dimensions
* Stitch Notes
* Special Instructions

These fields ensure production consistency for repeat orders.

---

# 8. Business Rules

* Every Job Item belongs to exactly one Job.
* A Job must contain at least one Job Item.
* Quantity must always be greater than zero.
* Rate cannot be negative.
* Line Total is always system calculated.
* Completed Job Items cannot be modified after invoicing.
* Archived Job Items remain available in historical records.

---

# 9. Validation Rules

Quantity

* Required.
* Must be greater than zero.

---

Rate

* Required.
* Must be zero or greater.

---

Design

* Optional in Version 1.
* If selected, it must reference an existing Design record.

---

Production Status

* Must follow the defined lifecycle.

---

# 10. Screen Layout

The Job Items section within a Job should display a table with the following columns:

* Item Number
* Position
* Design
* Quantity
* Rate
* Line Total
* Production Status
* Actions

Users should be able to:

* Add Item
* Edit Item
* Archive Item
* View Details

The table should support sorting and filtering.

---

# 11. Permissions

Business Owner:

* Full access.

Future Employee:

* Create and update Job Items.
* Cannot modify invoiced items.

Future Administrator:

* Full control, including restoration of archived items.

---

# 12. Error Cases

Examples:

* Quantity is zero.
* Rate is negative.
* Invalid status transition.
* Parent Job does not exist.
* Attempt to edit an invoiced Job Item.

Business error messages should clearly explain the issue and how to resolve it.

---

# 13. Acceptance Criteria

The module is complete when users can:

* Add multiple Job Items to a Job.
* Record embroidery specifications.
* Track production progress.
* Calculate line totals automatically.
* Prevent invalid edits after invoicing.
* Generate accurate billing data.

---

# 14. Future Enhancements

Potential Version 2 features:

* Estimated production time.
* Assigned machine.
* Assigned employee.
* Thread consumption tracking.
* Quality inspection status.
* Barcode or QR code support.

These features are intentionally excluded from Version 1.

---

# 15. Dependencies

Depends on:

* Customers
* Jobs
* Designs (optional in Version 1)

Required by:

* Invoices
* Reports
* Dashboard

---

# 16. API Requirements

The backend should provide endpoints to:

* Create Job Item
* Update Job Item
* Archive Job Item
* List Job Items by Job
* Update Production Status
* Get Job Item Details

---

# 17. Database Impact

Primary Entity:

JobItem

Relationships:

* One Job → Many Job Items
* One Design → Many Job Items (optional)
* One Job Item → Zero or More Attachments (future consideration)

---

# 18. Notes

The Job Item module represents the billable unit of work within the application.

Invoices, production tracking, reporting, and business analytics all depend on the accuracy of Job Item data.

This module should remain focused on production and billing information and should not include unrelated business functionality.
