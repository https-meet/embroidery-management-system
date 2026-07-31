# 🧵 EBMS Public Demo Guide & Showcase Reviewer Walkthrough

Welcome to the **Embroidery Business Management System (EBMS)** public demonstration environment!

EBMS is an enterprise-grade ERP designed specifically for real-world embroidery manufacturing businesses. This demonstration allows reviewers, recruiters, and clients to explore every major operational workflow in an isolated sandbox environment.

---

## 🔑 Demo Login Credentials

To access the demonstration sandbox:

- **Demo URL**: `https://embroidery-management-system-fronte.vercel.app` (or `https://ebms-demo.vercel.app`)
- **Email**: `demo@ebms.com` (or `admin@ebms.local`)
- **Password**: `demo123` (or `Admin@2026!`)

---

## 🎯 Key Features & Workflows to Explore

### 1. 📊 Executive Dashboard & Real-Time Analytics
- **Live Metrics**: Inspect total active jobs, revenue summary, quality check pass rates, and outstanding invoices.
- **Quick Actions**: Access 1-click order creation and tax invoice generation.

### 2. 🧵 Tajima `.DST` Embroidery File Reader & Real-Time Canvas Renderer
- **Upload `.DST` Files**: Navigate to **Designs → Add Design** or open any existing design.
- **Drag & Drop Upload**: Drag any Tajima `.DST` embroidery file into the uploader.
- **Auto-Extracted Specs**: Instantly extracts **Stitch Count**, **Color Change Stops**, and **Dimensions** in Inches (`3.50" × 4.00"`) and MM.
- **HTML5 Canvas Preview**: Decodes binary stitch deltas and renders a real-time thread color stitch path directly on an HTML5 canvas without requiring server file storage!

### 3. 💼 Job Orders & Production Lifecycle Workflow
- **Lifecycle Tracking**: Track orders through 6 production stages:
  > `Draft` ➔ `In Progress` ➔ `Quality Check` ➔ `Completed` ➔ `Delivered` ➔ `Invoiced`
- **Priority Badges**: Set priorities (`Low`, `Normal`, `High`) with color-coded status badges.
- **Job Slips**: View formatted job order slips for embroidery operators.

### 4. 🔬 Quality Check Inspection & Inspector Badges
- **Inspection Workspace**: Navigate to **Production → Quality Check**.
- **Inspector Logging**: Log inspectors (`(PASSED)` / `(FAILED)`).
- **Defects Pulse Alert**: Failing a quality check renders a red pulsing defect alert badge.

### 5. 🧾 GST Tax Invoice Generation & Dark Mode Printing
- **Automatic Billing**: Generate tax invoices from completed job orders.
- **Calculations**: Automatic calculation of subtotal, SGST (9%), CGST (9%), discounts, and total balance.
- **Crisp Print Engine**: Click **Print Invoice** — `@media print` CSS overrides dark theme variables to ensure printed PDFs always render in crisp, light theme white canvas with dark slate typography.

### 6. 💳 Payment Allocations & Customer 360
- **Multi-Method Payments**: Record payments via Cash, UPI, Bank Transfer, or Cheque.
- **Allocation**: Allocate single payments across multiple open invoices.

---

## 🛡️ Sandbox Safety & Nightly Reset

- **Isolated Sandbox**: All data created in this demo exists in an isolated sandbox database. Your testing will never touch or affect real business records.
- **Full Operational Capabilities**: You are free to create, edit, and test new customers, jobs, invoices, and designs.
- **Automated Nightly Reset**: The demo sandbox resets automatically every night at **02:00 AM UTC** to keep the demonstration clean and fresh.

---
*Thank you for evaluating EBMS!*
