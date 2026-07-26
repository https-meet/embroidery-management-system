# 04B_UBIQUITOUS_LANGUAGE.md

**Project:** Embroidery Business Management System (EBMS)

**Developer Kit Version:** 1.0

**Document Version:** 1.0

**Status:** Approved

---

# 1. Purpose

This document defines the official business vocabulary used throughout EBMS.

The objective is to ensure consistent terminology across:

* Business discussions
* Documentation
* Source code
* Database schema
* APIs
* User Interface
* Test cases
* AI-generated code

Every concept must have one official name.

If multiple names exist in the real world, EBMS selects one canonical term.

---

# 2. Naming Principles

The following principles govern terminology throughout the project.

## UL-001 One Business Concept = One Name

Every business concept has exactly one official name.

Example

Correct

```text id="u1t7v2"
Customer
```

Incorrect

```text id="7nfr0e"
Customer
Client
Party
Buyer
Account
```

Only **Customer** is used.

---

## UL-002 Business Language Before Technical Language

Names should reflect the embroidery business rather than software implementation.

Example

Preferred

```text id="r8z5cp"
Job Item
```

Avoid

```text id="1f4kmu"
EntityItem
ProductionObject
TaskNode
```

---

## UL-003 Avoid Abbreviations

Avoid abbreviations unless they are universally understood.

Preferred

```text id="j2n4ph"
Invoice
```

Avoid

```text id="em9qtd"
Inv
```

---

Preferred

```text id="phv3sb"
Payment Allocation
```

Avoid

```text id="v1dr94"
PayAlloc
```

---

# 3. Official Business Vocabulary

## Customer Domain

| Official Term     | Description                                |
| ----------------- | ------------------------------------------ |
| Customer          | Business receiving embroidery services     |
| Customer Code     | Human-readable customer identifier         |
| Customer Timeline | Chronological history of customer activity |
| Customer Summary  | Business overview of a customer            |

Avoid:

* Client
* Buyer
* Party
* Account Holder

---

## Production Domain

| Official Term     | Description                                  |
| ----------------- | -------------------------------------------- |
| Job               | Production order received from a customer    |
| Job Item          | Individual embroidery operation within a Job |
| Production Status | Current manufacturing stage                  |
| Position          | Embroidery location on the product           |

Avoid:

* Order
* Task
* Work
* Project
* Work Order

---

## Design Domain

| Official Term | Description                         |
| ------------- | ----------------------------------- |
| Design        | Reusable embroidery artwork         |
| Design File   | Physical file representing a design |
| Design Code   | Human-readable design identifier    |

Avoid:

* Artwork
* Logo File
* Graphic
* Asset

---

## Financial Domain

| Official Term       | Description                                             |
| ------------------- | ------------------------------------------------------- |
| Invoice             | Request for customer payment                            |
| Invoice Item        | Snapshot of billed work                                 |
| Outstanding Balance | Remaining unpaid amount on an Invoice                   |
| Discount            | Optional reduction applied to an Invoice subtotal       |
| Discount Type       | Whether the discount is a Percentage or Fixed Amount    |
| Discount Value      | The numeric input (percentage 0–100 or monetary amount) |
| Discount Amount     | The calculated monetary reduction applied to the Invoice |
| Grand Total         | The Invoice total after discount is applied             |
| Payment             | Money received from customer                            |
| Payment Allocation  | Distribution of payment across invoices                 |
| Payment Method      | The means by which a customer pays                      |
| Cash                | Physical currency payment                               |
| UPI                 | Unified Payments Interface digital payment              |
| Bank Transfer       | Direct bank-to-bank transfer (NEFT / RTGS / IMPS)       |
| Cheque              | Written order to pay from a bank account                |

Avoid:

* Bill
* Receipt (unless referring to a payment proof document)
* Payment Split

---

## Attachment Domain

| Official Term     | Description                  |
| ----------------- | ---------------------------- |
| Attachment        | Supporting business document |
| Approval Document | Customer approval evidence   |
| Purchase Order    | Customer purchase request    |
| Receipt           | Proof of payment             |

Avoid:

* File
* Upload
* Image

Not every uploaded file is an attachment.

---

## Administration Domain

| Official Term    | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| Settings         | Global application configuration                             |
| Business Profile | Company information                                          |
| Numbering Rule   | Rule for generating business identifiers                     |
| Permission       | Authorization capability                                     |
| Role             | Collection of permissions                                    |
| Archive          | The business action of soft-deleting an operational record   |
| Archived         | Status of a record that has been archived (soft-deleted)     |
| Cancel           | A status transition applied to Draft invoices (not deletion) |
| Cancelled        | Final status of a Draft invoice that was cancelled           |

Avoid:

* Config
* Master Data
* Globals
* Delete (when the business action is Archive)
* Remove (when the business action is Archive)

---

# 4. Status Vocabulary

Only the following status values are approved.

## Job

```text id="dk9b1r"
Draft

In Progress

Completed

Delivered

Cancelled
```

---

## Job Item

```text id="4h3sqv"
Draft

Pending Production

In Production

Completed

Cancelled
```

---

## Invoice

```text id="6q0xwf"
Draft

Issued

Partially Paid

Paid
```

---

## Payment

```text id="yx4fkp"
Draft

Confirmed
```

No alternative wording is permitted in code or UI.

---

# 5. API Vocabulary

API resources follow official business terminology.

Correct

```text id="q9t2ys"
/customers

/jobs

/job-items

/designs

/invoices

/payments

/settings
```

Avoid

```text id="c2z5wr"
/clients

/orders

/tasks

/bills

/config
```

---

# 6. Database Vocabulary

Database tables use singular business concepts in the Prisma model layer and conventional plural table names in PostgreSQL (implementation details are documented in the database design).

Examples

```text id="m4x8kn"
Customer

Job

JobItem

Invoice

Payment
```

Developers should not invent alternative names.

---

# 7. Code Vocabulary

Classes

```text id="az7fku"
CustomerService

JobRepository

InvoiceValidator

PaymentAllocation
```

---

Variables

```text id="g8m2ra"
customer

job

invoice

payment
```

---

Avoid

```text id="5b6cqa"
cust

ord

wrk

obj

tempData
```

Names should clearly communicate business meaning.

---

# 8. UI Vocabulary

User-facing labels should match the business language.

Correct

```text id="e5n8bw"
Create Job

Issue Invoice

Confirm Payment

Archive Customer

Cancel Invoice
```

Avoid

```text id="jn3v6d"
Create Order

Generate Bill

Delete Customer

Remove Invoice
```

---

# 9. Event Vocabulary

Domain Events follow the pattern:

```text id="t4q9he"
<Entity><PastTenseVerb>
```

Examples

```text id="kp2s8m"
CustomerCreated

JobCompleted

InvoiceIssued

PaymentConfirmed

SettingsUpdated
```

Avoid vague names.

```text id="pw7c5n"
Updated

Changed

Done

ActionPerformed
```

---

# 10. Documentation Rules

Every future document must use terminology defined here.

If a new business concept is introduced:

1. Add it to this document.
2. Define it clearly.
3. Use it consistently.
4. Avoid synonyms unless explicitly documented.

---

# 11. Governance

The Ubiquitous Language is a controlled vocabulary.

Changes require:

* Business review
* Architecture review
* Documentation update

No contributor should introduce unofficial terminology into:

* Source code
* APIs
* Database schema
* UI
* Documentation

without updating this document.

---

# End of Document
