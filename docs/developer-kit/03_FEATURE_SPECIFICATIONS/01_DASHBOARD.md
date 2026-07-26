# 03_FEATURE_SPECIFICATIONS/01_DASHBOARD.md

**Project Name:** Embroidery Business Management System (EBMS)

**Module:** Dashboard

**Developer Kit Version:** 1.0

**Version:** 1.0

**Status:** Approved

---

# 1. Purpose

The Dashboard is the landing page of the application.

It provides a real-time overview of the business and helps users decide what requires attention first.

The Dashboard is not intended to be a reporting page. Instead, it acts as a daily operational workspace.

---

# 2. Business Objectives

The Dashboard should allow users to:

* View today's workload.
* Monitor pending work.
* Track outstanding payments.
* Review recent activity.
* Access frequently used actions quickly.
* Understand the overall health of the business.

---

# 3. User Stories

### US-001

As a business owner,

I want to see important business information immediately after logging in,

so I know where to focus my attention.

---

### US-002

As a business owner,

I want to identify overdue work quickly,

so customer deliveries are not delayed.

---

### US-003

As a business owner,

I want to know which invoices are still unpaid,

so I can follow up with customers.

---

### US-004

As a business owner,

I want quick access to common actions,

so I can start working immediately.

---

# 4. Functional Requirements

The Dashboard shall display:

* Business summary.
* Pending jobs.
* Jobs due today.
* Recent invoices.
* Outstanding payments.
* Recent activity.
* Quick actions.

Data should refresh automatically whenever the user revisits the Dashboard.

---

# 5. Dashboard Layout

The Dashboard is divided into six sections.

## A. Welcome Header

Displays:

* Greeting
* Current Date
* Logged-in User

---

## B. Business Summary Cards

Display key metrics:

* Total Customers
* Active Jobs
* Pending Invoices
* Outstanding Balance

These values update automatically.

---

## C. Work Queue

Displays Jobs requiring attention.

Information:

* Job Number
* Customer
* Current Status
* Due Date
* Priority

Default sorting:

1. Overdue Jobs
2. Jobs due today
3. High priority
4. Remaining active Jobs

---

## D. Payment Follow-up

Displays unpaid or partially paid invoices.

Information:

* Invoice Number
* Customer
* Outstanding Amount
* Due Date

---

## E. Recent Activity

Chronological list of recent events.

Examples:

* Customer Created
* Job Created
* Job Completed
* Invoice Generated
* Payment Recorded

Newest activity appears first.

---

## F. Quick Actions

Buttons for common tasks:

* New Customer
* New Job
* Generate Invoice
* Record Payment
* Search Customer

These actions reduce navigation time.

---

# 6. Business Rules

* Dashboard information is read-only.
* Users must navigate to the appropriate module to edit records.
* Metrics are calculated in real time.
* Archived records are excluded unless explicitly configured otherwise.

---

# 7. Dashboard Widgets

Each widget answers a business question.

| Widget              | Business Question                       |
| ------------------- | --------------------------------------- |
| Total Customers     | How many active customers do we have?   |
| Active Jobs         | How much work is currently in progress? |
| Jobs Due Today      | What must be completed today?           |
| Outstanding Balance | How much money is yet to be collected?  |
| Recent Activity     | What happened recently?                 |
| Pending Invoices    | Which invoices still need attention?    |

If a widget does not help answer a business question, it should not be included.

---

# 8. Validation Rules

* Dashboard metrics must never show negative values.
* Missing data should display as zero rather than causing errors.
* Widgets should load independently so one failure does not prevent the entire Dashboard from loading.

---

# 9. Permissions

Business Owner:

* Full Dashboard access.

Future Employee:

* Dashboard limited to permitted data.

Future Administrator:

* Full Dashboard access with administrative widgets if required.

---

# 10. Error Handling

If dashboard data cannot be loaded:

* Display a clear message.
* Allow the user to retry.
* Continue showing any widgets that loaded successfully.

The Dashboard should degrade gracefully instead of becoming unusable.

---

# 11. Acceptance Criteria

The Dashboard is complete when the user can:

* Understand the current business status within a few seconds.
* Identify work requiring immediate attention.
* Access common actions without navigating through multiple pages.
* Review recent business activity.
* Monitor pending payments and active jobs.

---

# 12. Future Enhancements

Possible Version 2 improvements:

* Revenue trend charts.
* Weekly and monthly performance analytics.
* Customer growth metrics.
* Production efficiency metrics.
* Notification center.
* Customizable widgets.

These features are intentionally excluded from Version 1 to keep the Dashboard focused and easy to use.

---

# 13. Dependencies

Depends on:

* Customers
* Jobs
* Invoices
* Payments

The Dashboard does not own business data. It aggregates and presents information from other modules.

---

# 14. API Requirements

The backend should provide endpoints to retrieve:

* Dashboard summary metrics.
* Active job list.
* Jobs due today.
* Outstanding invoices.
* Recent activity.
* Quick statistics.

Dashboard data should be optimized to minimize the number of API requests.

---

# 15. Database Impact

The Dashboard does not create or own database tables.

It reads and aggregates data from existing entities to present business insights.

---

# 16. Notes

The Dashboard is the application's command center.

Its purpose is to help users decide what to do next, not to replace detailed reports or data entry screens.

Every widget should justify its existence by helping the user make a faster or better business decision.
