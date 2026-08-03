# 📝 EBMS Version Changelog

All notable changes to the **Embroidery Business Management System (EBMS)** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-08-03

### 🛡️ Backend Data Integrity & Stabilization (Sprint 1)

#### Changed
- **Atomic Payment Recording (`PaymentService.recordPayment`)**:
  - Refactored payment creation and invoice balance updates to execute inside an interactive `prisma.$transaction(async (tx) => ...)` block.
  - Guarantees atomic all-or-nothing rollback across `Payment`, `PaymentAllocation`, and `Invoice` entities if any allocation write fails.
  - Extended `PaymentRepository` and `InvoiceRepository` methods with optional `tx?: Prisma.TransactionClient` parameter for transaction client re-use.

---

## [1.0.0] - 2026-07-31

### 🚀 Initial Production Release & Public Demo Architecture

#### Added
- **Tajima `.DST` Binary Embroidery File Reader**:
  - Decodes Tajima binary headers client-side in browser memory (`dstParser.ts`).
  - Auto-extracts **Stitch Count**, **Color Stops**, and **Dimensions** in Inches & MM with zero server storage cost.
  - HTML5 Canvas stitch preview renderer generating thread path thumbnails without external storage.
- **Inches Dimension Unit Selector**:
  - Added unit selector (`Inches (in)` [default], `Millimeters (mm)`, `Centimeters (cm)`) to Design Form.
  - Formats dimensions as `3.50" × 4.00" (88.9mm × 101.6mm)` across Design Table and Workspace views.
- **Public Demo Sandbox & `IS_DEMO_MODE` Middleware**:
  - Added `demoGuard.ts` middleware intercepting administrative mutations (user management, tax config alteration) in public demo sandbox mode.
  - Environment-based seed credentials (`DEMO_EMAIL` / `DEMO_PASSWORD`).
  - Automated nightly seed reset strategy (`pnpm db:reset:demo`).
- **PWA (Progressive Web App) Support**:
  - Added `manifest.webmanifest`, offline caching Service Worker (`sw.js`), `registerSW.ts`, and theme metadata.
  - Installed PWA app shell loads in < 1 second.
- **Deployment Health Endpoint (`GET /health`)**:
  - Unauthenticated health check endpoint dynamically pinging database connection and reporting uptime.
- **Repository Security Hardening**:
  - Added `.env.example` templates for frontend and backend.
  - Enforced strict Zod validation rejecting default fallback secrets in production mode.
  - Sanitized login placeholders and updated root `.gitignore` with key/certificate/backup exclusions.
- **Documentation Suite**:
  - Created `DEPLOYMENT.md`, `DEMO_GUIDE.md`, `SECURITY.md`, and `FUTURE_ROADMAP.md`.

#### Fixed
- **Design Form Validation**: Fixed Zod input preprocessors so leaving optional numeric fields (Stitch count, Color count, Dimensions) blank cleanly evaluates to `undefined` without triggering validation errors.
- **Printable Tax Invoice Dark Mode**: Added `@media print` CSS overrides so printed PDFs always render in crisp light theme white canvas regardless of system dark mode settings.
- **Reports Date Range Filter**: Extended `endDate` to end-of-day timestamp (`23:59:59.999Z`) fixing 400 Bad Request responses.

---
*Baseline Version 1.0.0.*
