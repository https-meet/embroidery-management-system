# 03_FEATURE_SPECIFICATIONS/05_DESIGNS.md

**Project Name:** Embroidery Business Management System (EBMS)

**Module:** Design Management

**Developer Kit Version:** 1.0

**Version:** 1.0

**Status:** Approved

---

# 1. Purpose

The Design module manages all embroidery designs used by the business.

A Design is considered a reusable business asset rather than a simple uploaded file.

The module enables users to organize, search, preview, and reuse embroidery designs across multiple Jobs and Job Items.

---

# 2. Business Objectives

The module must allow users to:

* Store embroidery designs.
* Reuse existing designs.
* Organize designs efficiently.
* Link designs to Job Items.
* Search designs quickly.
* Maintain a historical record of design usage.

---

# 3. User Stories

### US-001

As a business owner,

I want to save embroidery designs,

so I don't lose them.

---

### US-002

As a business owner,

I want to reuse previous designs,

so repeat customer orders are faster.

---

### US-003

As a business owner,

I want to know where a design has been used,

so I can understand its history.

---

### US-004

As a business owner,

I want to preview designs before selecting them,

so I choose the correct file.

---

# 4. Functional Requirements

The system shall allow users to:

* Create a Design record.
* Upload one or more associated files.
* Edit design information.
* Archive designs.
* Search designs.
* Preview supported file types.
* View usage history.
* Link designs to Job Items.

---

# 5. Design Information

Each Design stores:

* Design Code
* Design Name
* Description (optional)
* Design Category (optional)
* Preview Image (optional)
* Primary Design File
* Status
* Notes (optional)
* Created Date
* Updated Date

The system generates the Design Code automatically.

Example:

DES-2026-000042

---

# 6. Supported Files (Version 1)

The system should allow storing common embroidery-related files, including:

* DST
* EMB
* PES
* PNG
* JPG
* JPEG
* PDF

The system stores file metadata while the files themselves are kept in cloud storage.

---

# 7. Design Workspace

Opening a Design should display:

## Design Details

* Name
* Code
* Description
* Status

---

## Preview

Image preview where available.

---

## Files

List of uploaded files with:

* File Name
* File Type
* Upload Date

---

## Usage History

Displays:

* Jobs using this design
* Job Items using this design
* Customers who have used this design

---

## Timeline

Chronological events such as:

* Design Created
* File Uploaded
* Design Updated
* Design Archived

---

# 8. Business Rules

* A Design may be linked to multiple Job Items.
* Deleting a Design must never remove historical references.
* Designs with usage history cannot be permanently deleted.
* Archiving a Design does not affect existing Jobs.

---

# 9. Validation Rules

Design Name

Required.

---

Primary File

Required when creating a new Design.

---

Supported File Types

Only approved file extensions are accepted.

---

Duplicate Detection

If a Design with the same name already exists, the system should warn the user before saving.

---

# 10. Search

Users should be able to search Designs by:

* Design Code
* Design Name
* Category
* Customer
* Job Number

Search should be fast and support partial matches.

---

# 11. Permissions

Business Owner:

* Full access.

Future Employee:

* View and attach existing designs.
* Upload new designs if permitted.

Future Administrator:

* Full management access.

---

# 12. Error Cases

Examples:

* Unsupported file format.
* Missing design name.
* Upload failure.
* Design not found.
* Attempt to delete a Design with linked Job Items.

Errors should provide clear guidance to the user.

---

# 13. Acceptance Criteria

The module is complete when users can:

* Create Designs.
* Upload associated files.
* Search Designs quickly.
* Preview available images.
* Link Designs to Job Items.
* View Design usage history.
* Archive Designs without losing historical data.

---

# 14. Future Enhancements

Potential Version 2 features:

* Design versioning.
* Stitch count.
* Thread color palette.
* Estimated production time.
* AI-powered design search.
* Similar design recommendations.

These features are intentionally excluded from Version 1.

---

# 15. Dependencies

Depends on:

* File Storage

Required by:

* Job Items
* Reports

---

# 16. API Requirements

The backend should provide endpoints to:

* Create Design
* Upload Design File
* Get Design Details
* Search Designs
* Update Design
* Archive Design
* List Design Usage

---

# 17. Database Impact

Primary Entity:

Design

Relationships:

* One Design → Many Job Items
* One Design → Many Files
* One Design → Many Usage Records (derived)

---

# 18. Notes

The Design module is intended to become the business's central design library.

It should help reduce duplicate work, improve consistency, and make repeat orders significantly faster by treating embroidery designs as reusable business assets rather than isolated files.
