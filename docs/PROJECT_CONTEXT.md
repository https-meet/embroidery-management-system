# Embroidery Business Management System (EBMS)
> Project Context Document (Version 1.0)

---

# 1. Project Overview

## Project Name

Embroidery Business Management System (EBMS)

> **Note**
>
> "EBMS" is currently the project name.
>
> The final product/brand name will be decided later during the branding phase.

---

# Vision

To build a modern business management platform that helps small and medium embroidery businesses organize their daily work, reduce mental workload, improve customer management, and streamline operations without changing the way they naturally work.

---

# Mission

The software should become the owner's second memory.

Instead of asking business owners to remember orders, payments, customer history, due dates, and design files, the software should organize and present that information at the right time.

---

# Core Philosophy

The software should reduce mental effort.

It should never increase computer work.

---

# 2. Why This Project Exists

Running a small embroidery business is very different from running a factory.

Most customer communication happens through:

• WhatsApp

• Phone Calls

• Walk-in Customers

Important information is often spread across:

• Physical notebook

• WhatsApp conversations

• Laptop folders

• The owner's memory

Although this workflow works because of years of experience, it becomes increasingly difficult to manage as the business grows.

Common problems include:

- Forgetting pending work
- Searching old notebook entries
- Manually calculating pending payments
- Finding old embroidery design files
- Tracking customer history
- Organizing repeat orders

EBMS exists to solve these problems while preserving the natural workflow of the business.

---

# 3. Business Background

This software is being built for a real home-based embroidery business.

The business specializes in:

Computer Embroidery

The business DOES NOT perform cloth stitching.

Customers usually bring:

• Shirts

• Kurtas

• Collar Pieces

• Cuffs

• Uniform Pieces

• Fabric Pieces

The embroidery work is performed using:

Brother Computer Embroidery Machine

Embroidery designs are created using:

Wilcom Embroidery Studio

---

# Current Team

Owner

Responsible for:

- Customer communication
- Design creation
- Machine operation
- Delivery
- Payment collection

Staff

Currently assists in business operations.

Future versions of the software should support additional employees.

---

# 4. Business Workflow

Customer contacts business

↓

Discussion through Phone / WhatsApp

↓

Customer sends cloth

↓

Customer shares embroidery design

↓

Design created in Embroidery Studio

↓

Design prepared for embroidery

↓

Machine setup

↓

Embroidery production

↓

Quality check

↓

Customer informed

↓

Delivery

↓

Payment

↓

Order archived

---

# 5. Current Pain Points

## Problem 1

Business knowledge exists inside the owner's memory.

Example:

- Urgent orders
- Due dates
- Customer preferences

Software Goal:

Remember information so people don't have to.

---

## Problem 2

Notebook is the primary source of records.

Searching old work takes time.

Software Goal:

Digital searchable history.

---

## Problem 3

Important information exists in WhatsApp.

Design images

Sizes

Thread colors

Instructions

Software Goal:

Store essential information inside the order.

---

## Problem 4

Pending payments are manually calculated.

Owner currently searches notebook entries before sending customer payment details.

Software Goal:

Automatic customer ledger.

---

## Problem 5

Embroidery design files become difficult to organize.

Software Goal:

Searchable Design Library.

---

# 6. Product Principles

## Principle 1

Speed over complexity.

---

## Principle 2

Minimal clicks.

---

## Principle 3

Workflow first.

The software should follow the natural business workflow instead of forcing users to learn a completely new process.

---

## Principle 4

Software remembers.

Users should not need to remember:

- Pending work
- Previous prices
- Previous designs
- Customer history

---

## Principle 5

Professional but simple.

The application should look premium without becoming difficult to use.

---

## Principle 6

Responsive by design.

Desktop experience is primary.

Mobile experience should remain excellent.

---

## Principle 7

Every feature must solve a real business problem.

No unnecessary enterprise features.

---

# 7. Target Users

Primary User

Owner

Goals:

- Track work
- Manage customers
- Receive payments
- Find previous orders quickly

---

Secondary User

Staff

Goals:

- View assigned work
- Update order status
- Assist production

---

Future Users

Business employees

Multiple branches

Workshop managers

---

# 8. Dashboard Philosophy

The dashboard is NOT an analytics page.

The dashboard is a decision page.

When the owner opens the application, it should answer:

"What should I work on today?"

The dashboard contains two sections.

---

Operations

- Today's Orders
- Urgent Orders
- Production Queue
- Pending Payments
- Quick Actions

---

Business Insights

- Revenue Trend
- Monthly Orders
- Pending Collections
- Top Customers
- Repeat Customers
- Monthly Growth

Analytics support decisions.

They never replace workflow.

---

# 9. Core Modules

Authentication

Dashboard

Customers

Orders

Design Library

Production

Payments

Reports

Settings

---

# 10. Hero Features

Repeat Orders

Duplicate previous orders with minimal changes.

---

Customer Ledger

Automatically calculate outstanding amounts.

---

Design Library

Search previous embroidery designs.

---

Customer Timeline

Complete order history.

---

Production Queue

Track work in progress.

---

Pending Payments

Automatic outstanding balance.

---

# 11. Technology Stack

Frontend

React

Vite

TypeScript

Tailwind CSS

shadcn/ui

TanStack Query

React Router

Axios

React Hook Form

Zod

Lucide React

Sonner

---

Backend

Node.js

Express

TypeScript

Prisma

PostgreSQL

JWT Authentication

REST API

Backend is already completed.

Frontend must consume existing APIs.

---

# 12. UI Philosophy

Professional SaaS appearance.

Inspired by:

- Stripe
- Linear
- GitHub
- Notion
- Vercel

Avoid:

- Flashy gradients
- Heavy animations
- Glassmorphism
- Decorative dashboards

Focus on:

- Clean spacing
- Strong typography
- Readability
- Accessibility
- Fast interactions

---

# 13. Theme

Support:

Light

Dark

System

Theme preference should persist.

---

# 14. Development Principles

Feature-based architecture.

Reusable components.

Strong typing.

Scalable folder structure.

Consistent naming.

Responsive design.

Accessibility first.

Reusable business logic.

Minimal duplication.

---

# 15. Long-Term Vision

Future versions may include:

- WhatsApp integration
- AI-assisted design search
- Inventory Management
- Multi-machine support
- Barcode / QR support
- Cloud Backup
- Invoice Generation
- Business Analytics
- Multi-branch support

These are future possibilities, not current requirements.

---

# 16. Things We Deliberately Do NOT Do

We do not replace Embroidery Studio.

We do not replace WhatsApp communication.

We do not force unnecessary workflows.

We do not build features only because enterprise ERPs have them.

We build only what solves real business problems.

---

# 17. Definition of Success

This project succeeds when:

The owner spends less time searching.

The owner spends less time remembering.

The owner spends less time calculating.

The owner spends more time doing embroidery.

---

# 18. Decision Log

Decision 001

Backend architecture is frozen.

Frontend must adapt to existing APIs.

---

Decision 002

Owner and Staff are the primary roles exposed in the UI.

---

Decision 003

Dashboard prioritizes daily operations before business analytics.

---

Decision 004

Repeat Orders are a first-class feature.

---

Decision 005

Customer Ledger is a core feature.

---

Decision 006

Every new feature must solve a real business problem.

---

END OF DOCUMENT