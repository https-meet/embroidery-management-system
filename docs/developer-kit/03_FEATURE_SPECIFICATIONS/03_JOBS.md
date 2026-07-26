# 03_FEATURE_SPECIFICATIONS/03_JOBS.md

**Project Name:** Embroidery Business Management System (EBMS)

**Module:** Job Management

**Developer Kit Version:** 1.0

**Version:** 1.0

**Status:** Approved

---

# 1. Purpose

The Job module records every embroidery order received from a customer.

A Job acts as the parent container for one or more Job Items and tracks the overall lifecycle of an order, from creation to delivery.

Every Job must belong to exactly one Customer.

---

# 2. Business Objectives

The Job module should allow users to:

* Create a new embroidery job.
* Record customer requirements.
* Group related embroidery work.
* Track production progress.
* Generate invoices after work is completed.
* Maintain a complete historical record.

---

# 3. User Stories

### US-001

As a business owner,

I want to create a Job for a customer,

so I can organize all embroidery work for that order.

---

### US-002

As a business owner,

I want one Job to contain multiple embroidery tasks,

so similar work stays together.

---

### US-003

As a business owner,

I want to monitor the status of each Job,

so I know what work is pending.

---

### US-004

As a business owner,

I want to review completed Jobs,

so I can answer customer questions quickly.

---

# 4. Functional Requirements

The system shall allow users to:

* Create Jobs.
* Edit Jobs before invoicing.
* View Job details.
* Search Jobs.
* Archive Jobs.
* Change Job Status.
* View Job history.
* Link Job to Invoices.
* Link Job to Attachments.

---

# 5. Job Information

Each Job stores:

* Job Number
* Customer
* Job Date
* Expected Delivery Date (optional)
* Priority (Low, Normal, High)
* Overall Status
* Notes
* Created By
* Created Date
* Updated Date

The system generates the Job Number automatically.

Example:

JOB-2026-000125

---

# 6. Job Status Lifecycle

Allowed statuses:

Draft

↓

In Progress

↓

Completed

↓

Delivered

Cancelled

Rules:

* Jobs begin in **Draft**.
* Users can move Draft → In Progress.
* Completed Jobs can become Delivered.
* Cancelled Jobs cannot be resumed without administrative action.
* Delivered Jobs are considered closed.

---

# 7. Job Workspace

Opening a Job displays a dedicated workspace containing:

## Job Summary

* Job Number
* Customer
* Dates
* Priority
* Status

---

## Job Items

A table of all embroidery operations linked to the Job.

---

## Attachments

Reference artwork, customer files, or production notes.

---

## Invoice Information

Displays invoices created from this Job.

---

## Timeline

Chronological events such as:

* Job Created
* Item Added
* Status Changed
* Invoice Generated
* Job Delivered

---

# 8. Business Rules

* Every Job belongs to exactly one Customer.
* Every Job must contain at least one Job Item before it can move to **In Progress**.
* A Job cannot be invoiced until all billable Job Items are completed.
* A Delivered Job cannot be returned to Draft.
* Historical Jobs remain searchable even if archived.

---

# 9. Validation Rules

Customer

Required.

---

Job Date

Required.

Cannot be in the future unless specifically allowed.

---

Priority

Required.

Defaults to **Normal**.

---

Status

System controlled.

Users cannot skip required workflow stages.

---

# 10. Permissions

Business Owner:

* Full access.

Future Employee Role:

* Create Jobs.
* Edit permitted fields.
* View Jobs.

Future Admin Role:

* Full control, including restoring archived Jobs.

---

# 11. Error Cases

Examples:

* Customer not selected.
* Job has no Job Items.
* Invalid status transition.
* Job already delivered.
* Attempt to modify a locked Job.

Error messages should explain the problem in clear business language.

---

# 12. Acceptance Criteria

The Job module is complete when users can:

* Create a Job.
* Assign it to a Customer.
* Add Job Items.
* Track status.
* Search Jobs.
* View Job history.
* Archive completed Jobs without losing records.

---

# 13. Future Enhancements

Potential Version 2 features:

* Production stages.
* Machine assignment.
* Employee assignment.
* Estimated completion time.
* Job templates.
* Barcode or QR Code support.

These features are intentionally excluded from Version 1.

---

# 14. Dependencies

Depends on:

* Customer Module.

Required by:

* Job Items.
* Invoices.
* Reports.
* Dashboard.

---

# 15. API Requirements

The backend should support:

* Create Job
* Get Job by ID
* List Jobs
* Search Jobs
* Update Job
* Archive Job
* Update Job Status
* Get Job Timeline

---

# 16. Database Impact

Primary Entity:

Job

Relationships:

* One Customer → Many Jobs
* One Job → Many Job Items
* One Job → Many Attachments
* One Job → Zero or More Invoices

---

# 17. Notes

The Job module represents the business order as a whole.

Detailed production work belongs to the Job Item module.

The Job should remain lightweight while serving as the central container for all work associated with a customer order.
