# 00_MASTER_CONTEXT.md

**Project Name:** Embroidery Business Management System (EBMS)

**Developer Kit Version:** 1.0

**Document Version:** 1.0

**Status:** Approved

**Document Type:** Master Context

**Owner:** Meet Chauhan

**Purpose:** Single Source of Truth (SSOT)

---

# 1. Purpose of this Document

This document is the primary source of truth for the Embroidery Business Management System project.

Every developer, AI coding assistant, reviewer, or future contributor must read and understand this document before making any architectural or implementation decisions.

If any other document conflicts with this document, this document takes precedence unless a newer version has been officially approved.

---

# 2. Project Overview

The Embroidery Business Management System (EBMS) is a production-ready web application designed to digitize the daily operations of a family-owned computer embroidery business.

The goal is to replace paper notebooks with a reliable, scalable, and easy-to-use software system that manages the complete workflow from receiving customer work to generating invoices and recording payments.

This software is intended for real-world daily business use, not as a demonstration project or academic assignment.

---

# 3. Business Background

The current business operates using handwritten notebooks.

Typical workflow:

1. Customer visits or contacts the business.
2. Embroidery work is discussed.
3. Design details are finalized.
4. Quantity and rates are agreed upon.
5. Work is completed.
6. Work details are written manually.
7. Invoice is prepared manually.
8. Customer makes payment.
9. Payment is recorded manually.

Problems with this workflow include:

* Difficult to search old work.
* Manual invoice preparation.
* Payment tracking is error-prone.
* No centralized history.
* Risk of data loss.
* Difficult reporting.

The purpose of this software is to eliminate these issues while keeping the workflow simple.

---

# 4. Mission Statement

Build a simple, reliable, and scalable web application that digitizes the complete embroidery workflow—from customer management and job tracking to invoicing and payment collection—while remaining intuitive enough for daily use by a small family-run embroidery business.

---

# 5. Vision

The software should become the daily operating system of the embroidery business.

It should:

* Reduce manual work.
* Save time.
* Prevent mistakes.
* Preserve historical records.
* Support business growth.
* Remain simple enough that new users can learn it quickly.

---

# 6. Target Users

### Primary Users

* Business Owner
* Family Members

### Future Users

* Employees
* Reception Staff
* Office Staff
* Accountant

---

# 7. Version 1 Objectives

Version 1 focuses only on the core business workflow.

Included:

* Customer Management
* Job Management
* Job Item Management
* Design Management
* File Attachments
* Invoice Generation
* Payment Recording
* Dashboard
* Search
* Reports

---

# 8. Explicitly Out of Scope (Version 1)

The following features are intentionally excluded:

* Inventory Management
* Thread Stock Tracking
* Machine Maintenance
* Employee Attendance
* GST Automation
* WhatsApp Integration
* SMS Notifications
* Customer Portal
* AI Predictions
* Mobile Application

These may be considered in future versions but are not part of Version 1.

---

# 9. Product Philosophy

The software must follow these principles.

### Business First

Business workflow is more important than technical preference.

### Simplicity

Simple solutions are preferred over clever solutions.

### Accuracy

Correct data is more important than automation.

### Reliability

The software should never risk losing business information.

### Productivity

Every screen should reduce the user's effort.

---

# 10. Core Business Workflow

Customer

↓

Job

↓

Job Items

↓

Production

↓

Invoice

↓

Payment

↓

Reports

Every feature in the application should support or improve this workflow.

---

# 11. Core Modules

* Dashboard
* Customers
* Jobs
* Job Items
* Designs
* Attachments
* Invoices
* Payments
* Reports
* Settings

---

# 12. Technology Stack

Repository Structure

* pnpm Workspace Monorepo
* apps/backend — Node.js / Express / Prisma API
* apps/frontend — React / Vite SPA
* packages/shared — Shared TypeScript types, DTOs, and constants (no business logic)
* packages/config — Shared ESLint, Prettier, and TypeScript base configurations

Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* TanStack Query
* React Hook Form

Backend

* Node.js
* Express
* TypeScript

Authentication

* JWT Access Tokens
* JWT Refresh Tokens
* bcrypt
* Role-Based Access Control (RBAC)

Database

* PostgreSQL
* Prisma ORM

Storage

* Supabase Storage (S3-compatible cloud object storage)
* All file access through FileStorageService abstraction layer
* Binary files stored in Supabase Storage; file metadata stored in PostgreSQL

Deployment

* Vercel (Frontend)
* Railway (Backend)
* Supabase (Database + File Storage)

---

# 13. Architecture Principles

The application will use a feature-based architecture.

Each feature owns:

* Routes
* Controller
* Service
* Repository
* Validation
* Types

Business logic belongs inside services.

Database queries belong inside repositories.

Controllers remain thin.

---

# 14. Data Principles

* UUID as primary key.
* Soft delete for business records.
* Database transactions for multi-step operations.
* No duplicated data.
* Proper normalization.
* Audit history preserved.
* Never trust client-side validation.

---

# 15. User Experience Principles

* Common tasks should require as few clicks as practical.
* Forms should be clear and consistent.
* Error messages should explain the problem.
* Search should be available wherever useful.
* The dashboard should help users decide what to do next.

---

# 16. Coding Principles

* Strict TypeScript.
* Feature-based architecture.
* Single Responsibility Principle.
* Clean Code practices.
* SOLID where appropriate.
* Reusable components.
* Consistent API responses.
* No placeholder code in production.

---

# 17. AI Development Rules

Any AI assisting with development must follow these rules:

* Do not redesign the architecture.
* Do not invent business workflows.
* Do not rename entities without approval.
* Do not change the database structure arbitrarily.
* Follow the documentation exactly.
* Build one feature at a time as a complete vertical slice.
* Keep code production-ready.
* Explain major technical decisions.
* Consult 13_ADR_INDEX.md before making any architectural decision.
* New architectural decisions must be recorded as ADRs before implementation begins.

---

# 18. Success Criteria

Version 1 will be considered successful if the business owner can:

* Create customers easily.
* Record jobs quickly.
* Generate invoices accurately.
* Record payments reliably.
* Search historical work efficiently.
* Operate the software confidently after a short introduction.

---

# 19. Project Philosophy

This project is not being developed to demonstrate programming skills.

It is being developed to solve a real business problem.

Every design decision, database table, API endpoint, and user interface component must have a clear business purpose.

If a feature does not improve the business workflow, it should not be included in Version 1.

---

# 20. Document Status

Status: Draft v1.0

This document becomes the foundation for all future project documentation, including:

* Project Vision
* Business Rules
* Product Requirements Document (PRD)
* System Architecture
* Database Design
* API Specification
* UI Specification
* Coding Standards
* AI Development Guide
* Development Plan

All future documents must remain consistent with this Master Context unless formally revised.
