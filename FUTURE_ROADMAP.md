# 🚀 EBMS Future Roadmap & Commercial Expansion Plan

This document outlines planned future features, operational tools, and architectural enhancements saved for future commercial scaling of the **Embroidery Business Management System (EBMS)**.

---

## 🏭 Category 1: Factory Floor & Commercial Scaling

### 1. 📱 Automated WhatsApp Order Notifications
- **Concept**: Integrate WhatsApp Business API / Twilio Webhooks to automatically send order status updates directly to clients' WhatsApp numbers when a job transitions to `COMPLETED` or `DELIVERED`.
- **Target Audience**: Clients & Wholesale Buyers.
- **Priority**: Medium (Planned for factory expansion phase).

### 2. 🏷️ Printable QR Code Job Tickets & Barcode Scanner Mode
- **Concept**: Print a unique QR code or Code128 barcode on operator job slips. Operators on the factory floor scan the QR code using a tablet or barcode scanner to instantly pull up the job and mark Quality Check status.
- **Target Audience**: Larger factories with 5+ machine operators.
- **Priority**: Medium-Low (Deferred until team expands beyond 2 people).

### 3. 🧵 Enhanced Tajima `.DST` Reader Tools
- **Thread Color Palette Customizer**: Allow operators to click canvas thread lines and assign specific thread color codes (e.g. Madeira Gold #1024, Isacord Navy #3600).
- **Automated Stitch Pricing Calculator**: Calculate job estimates based on stitch count rules (e.g. `24,500 stitches × ₹20 / 1000 = ₹490`).

---

## 🩺 Category 2: Infrastructure & Reliability Enhancements

### 1. 🚦 Separated Liveness (`/health/live`) & Readiness (`/health/ready`) Endpoints
- **Concept**: Separate Kubernetes/Render health checks into a lightweight liveness check (`GET /health/live` returning 200 OK if server process is running) and a deep readiness check (`GET /health/ready` verifying DB connection & memory limits).

### 2. 📦 Service Worker Cache Versioning
- **Concept**: Version PWA service worker caches (`ebms-v1.0.1`, `ebms-v1.0.2`) with automatic cache busting on new Vercel deployments to ensure clients receive UI updates instantly.

### 3. ℹ️ Application Version & Build Metadata Endpoint (`GET /version`)
- **Concept**: Expose git commit hash, build timestamp, and semantic version number (`v1.0.0`) via an unauthenticated `GET /version` endpoint.

---

## 💾 Category 3: Automated Backups & Cloud Storage

### 1. ☁️ Google Drive & Cloud Backup Sync
- **Concept**: Automated weekly export of JSON system backups directly into a dedicated `EBMS_Database_Backups` folder in Google Drive using OAuth2 API.
- **Priority**: Medium.

---
*Maintained for EBMS v1.0 Production Release.*
