# 03_FEATURE_SPECIFICATIONS/06_ATTACHMENTS.md

**Project Name:** Embroidery Business Management System (EBMS)

**Module:** Attachment Management

**Developer Kit Version:** 1.0

**Version:** 1.0

**Status:** Approved

---

# 1. Purpose

The Attachment module provides a centralized way to upload, organize, and manage supporting documents related to business records.

Unlike Design Files, Attachments are general-purpose documents that support business operations and can be associated with Customers, Jobs, Job Items, and Invoices.

The Attachment module should be reusable across the application.

---

# 2. Business Objectives

The module must allow users to:

* Upload supporting documents.
* Associate files with business records.
* Preview supported files.
* Download attachments.
* Archive attachments.
* Maintain a complete upload history.

---

# 3. User Stories

### US-001

As a business owner,

I want to attach customer reference images,

so production staff understands the requirements.

---

### US-002

As a business owner,

I want to store purchase orders and approvals,

so all documents remain in one place.

---

### US-003

As a business owner,

I want to access attachments directly from a Job,

so I don't search through computer folders.

---

### US-004

As a business owner,

I want historical documents to remain available,

even years later.

---

# 4. Functional Requirements

The system shall allow users to:

* Upload files.
* Associate files with supported entities.
* Preview supported file types.
* Download files.
* Rename attachment titles (without changing the original file).
* Archive attachments.
* View upload history.

---

# 5. Attachment Information

Each Attachment stores:

* Attachment ID
* Display Title
* Original File Name
* File Type
* File Size
* Storage Path
* Linked Entity Type
* Linked Entity ID
* Uploaded By
* Upload Date
* Updated Date
* Archived Status

---

# 6. Supported Entities

An Attachment may belong to one of the following:

* Customer
* Job
* Job Item
* Invoice

Version 1 intentionally limits attachments to a single parent entity.

---

# 7. Supported File Types

Version 1 supports:

Documents:

* PDF
* DOCX
* XLSX

Images:

* JPG
* JPEG
* PNG
* WEBP

Other:

* ZIP

Additional formats may be introduced in future versions.

---

# 8. Attachment Workspace

Each linked record should display an "Attachments" section containing:

* File Icon
* Display Title
* File Type
* File Size
* Upload Date
* Uploaded By
* Actions

Available actions:

* Preview (when supported)
* Download
* Rename Display Title
* Archive

---

# 9. Business Rules

* Attachments do not own business data.
* Removing an Attachment must never delete the linked business record.
* Archiving a parent record does not delete its Attachments.
* Original uploaded files remain unchanged after upload.
* The system stores file metadata separately from file content.

---

# 10. Validation Rules

Display Title

Required.

---

File

Required.

---

Maximum File Size

Configured by the system administrator.

---

Supported Extensions

Only approved file types may be uploaded.

---

Duplicate Upload

The system may warn users when uploading files with the same name to the same business record.

---

# 11. Permissions

Business Owner:

* Full attachment management.

Future Employee:

* Upload and download attachments.
* Archive attachments if permitted.

Future Administrator:

* Full access.

---

# 12. Error Cases

Examples:

* Unsupported file type.
* File exceeds size limit.
* Upload interrupted.
* Linked business record does not exist.
* Attachment not found.

The system should provide clear, user-friendly error messages.

---

# 13. Acceptance Criteria

The module is complete when users can:

* Upload attachments.
* Associate them with supported business records.
* Preview supported files.
* Download files.
* Archive attachments.
* View attachment history.

---

# 14. Future Enhancements

Potential Version 2 features:

* Drag-and-drop uploads.
* Multiple file uploads.
* Folder organization.
* File version history.
* OCR search for PDF documents.
* Virus scanning integration.

These features are intentionally excluded from Version 1.

---

# 15. Dependencies

Depends on:

* File Storage Service

Required by:

* Customers
* Jobs
* Job Items
* Invoices

---

# 16. API Requirements

The backend should provide endpoints to:

* Upload Attachment
* Get Attachment Details
* Download Attachment
* List Attachments by Entity
* Update Attachment Title
* Archive Attachment

---

# 17. Database Impact

Primary Entity:

Attachment

Relationships:

* One Customer → Many Attachments
* One Job → Many Attachments
* One Job Item → Many Attachments
* One Invoice → Many Attachments

Files are stored in cloud storage, while metadata is stored in the database.

---

# 18. Notes

The Attachment module provides a reusable document management capability across the application.

It is intentionally separate from the Design module, which manages reusable embroidery assets.

This distinction keeps business documents and production assets clearly separated, simplifying future maintenance and permissions.
