# Embroidery Business Management System (EBMS)

A modern business management system for embroidery operations.

## Structure

```
ebms/
├── apps/
│   ├── backend/          # Node.js / Express / TypeScript / Prisma API
│   └── frontend/         # React / Vite / TypeScript SPA
├── packages/
│   ├── shared/           # Shared TypeScript types, DTOs, constants
│   └── config/           # Shared ESLint, Prettier, TypeScript configs
└── docs/
    └── developer-kit/    # Developer Kit v1.0 (frozen — do not modify)
```

## Prerequisites

- Node.js >= 20
- pnpm >= 9

## Setup

```bash
# Install all workspace dependencies
pnpm install
```

## Developer Kit

All architecture decisions, business rules, and implementation standards are documented in [`docs/developer-kit/`](./docs/developer-kit/).

**Do not modify Developer Kit documents without owner approval.**

The ADR Index is at [`docs/developer-kit/13_ADR_INDEX.md`](./docs/developer-kit/13_ADR_INDEX.md).

## Development

```bash
# Start backend dev server
pnpm dev:backend

# Start frontend dev server
pnpm dev:frontend
```
