> **Note:** This document defines the engineering standard for backend migrations. If there is any conflict between this document and an approved Architecture Decision Record (ADR), the ADR takes precedence.

# Backend Migration Standard

**Project:** Embroidery Business Management System (EBMS)

**Version:** 1.0

**Status:** Active

**Last Updated:** August 2026

---

# Purpose

This document defines the official backend migration standard for the Embroidery Business Management System (EBMS).

Its purpose is to ensure every backend migration follows the same architecture, coding principles, verification process, and quality standards.

All backend migrations must follow this document unless an Architecture Decision Record (ADR) explicitly states otherwise.

---

# Objectives

Every migration must achieve the following goals:

- Support complete Production and Demo database isolation.
- Preserve existing business behaviour.
- Preserve API compatibility.
- Preserve backwards compatibility.
- Reduce architectural debt.
- Minimize implementation risk.
- Be independently testable.
- Be independently reviewable.

A migration improves architecture only.

It must **not** introduce new features or alter existing business behaviour unless explicitly requested.

---

# Migration Scope

Each migration targets **only the requested module**.

Example:

Migrating the Customer module allows changes to:

- Customer Repository
- Customer Service
- Customer Controller

It does **not** allow unrelated modifications to:

- Authentication
- Jobs
- Invoices
- Payments
- Reports
- Frontend

unless strictly required for compatibility.

Scope creep is not permitted.

---

# Official Architecture Pattern

EBMS uses the following request flow:

```text
HTTP Request
        │
        ▼
Controller
        │
        ▼
Service
        │
        ▼
Repository
        │
        ▼
Prisma Client
        │
        ▼
PostgreSQL
```

Every migrated module must follow this architecture.

No new architectural pattern may be introduced during migration.

---

# Dependency Injection Pattern

EBMS follows the **Hybrid Migration Pattern**.

During migration:

- Repositories receive `PrismaClient` through constructor injection.
- Services support dependency injection.
- Controllers obtain `PrismaClient` from the current request.
- Existing singleton exports remain functional until the final cleanup phase.

This allows gradual migration without breaking existing modules.

---

# Repository Standard

Repositories are responsible only for database access.

Repositories must:

- Accept `PrismaClient` through constructor injection.
- Never contain business logic.
- Never inspect request objects.
- Never read environment variables.
- Never create Prisma clients.

Standard constructor:

```typescript
constructor(
    private readonly prisma: PrismaClient = defaultPrisma
)
```

The default fallback exists only for backwards compatibility.

---

# Service Standard

Services coordinate business logic.

Services may receive either:

- Repository

or

- PrismaClient

When a Prisma client is provided, the service creates its own repository.

Services must never directly access HTTP request objects.

Business rules belong only in Services.

---

# Controller Standard

Controllers are request-aware.

Controllers must obtain Prisma from:

```typescript
req.database?.prisma
```

Controllers instantiate request-scoped services when request context exists.

Controllers must not contain business logic.

Controllers must remain responsible only for:

- HTTP request parsing
- Validation
- Response generation

---

# Database Context

Every incoming request contains:

```typescript
req.database
```

containing:

- environment
- prisma

Controllers must never inspect:

- NODE_ENV
- IS_DEMO_MODE
- DATABASE_URL

Database selection is handled by the request database context.

---

# Backwards Compatibility

Every migration must preserve:

- Existing routes
- Existing APIs
- Existing response formats
- Existing validation
- Existing exports
- Existing singleton instances
- Existing tests

Modules that have not yet been migrated must continue working without modification.

---

# Business Logic Protection

Migration must **not** modify:

- Business rules
- Number generation
- Validation
- Permissions
- Roles
- Sorting
- Searching
- Pagination
- Archive behaviour
- Restore behaviour
- API contracts
- Database schema

Architecture changes only.

---

# Verification Requirements

Every migration must verify:

## Production

- Uses `ebms_production`
- No writes occur in `ebms_demo`

## Demo

- Uses `ebms_demo`
- No writes occur in `ebms_production`

## Build

- TypeScript compilation passes
- No build errors

## Tests

- Existing tests pass

## Compatibility

- Existing singleton exports continue working
- Existing consumers require no modification

---

# Definition of Done

A migration is complete only if all of the following are true:

- Repository migrated
- Service migrated
- Controller migrated
- Uses request database context
- Uses dependency injection
- Build passes
- Tests pass
- Production verified
- Demo verified
- Backwards compatibility verified
- No scope creep introduced

---

# Commit Policy

Checkpoint commits are created only after completing an entire migration wave.

Do not commit partially migrated modules.

Do not push until:

- Review completed
- Verification completed
- Checkpoint approved

---

# Standard Migration Report

Every migration report must contain:

1. Files Modified

2. Verification Summary

3. Build Status

4. Test Status

5. Remaining Direct `prisma.ts` Imports

6. Migration Progress

7. Architectural Debt Discovered

8. Unexpected Issues

9. Migration Pattern Compliance

Reports should remain concise.

---

# Architectural Debt

If unrelated issues are discovered during migration:

Do **not** fix them immediately.

Instead, record them under:

**Architectural Debt**

These items will be addressed during the final Architecture Cleanup phase.

---

# Migration Checklist

Before requesting a checkpoint commit, verify:

- [ ] Scope respected
- [ ] No unrelated modules modified
- [ ] Repository migrated
- [ ] Service migrated
- [ ] Controller migrated
- [ ] Request DatabaseContext used
- [ ] Dependency Injection implemented
- [ ] Backwards compatibility preserved
- [ ] Production isolation verified
- [ ] Demo isolation verified
- [ ] Build passed
- [ ] Tests passed
- [ ] Git status reviewed
- [ ] Migration report generated

---

# Guiding Principles

Every backend migration should follow these principles:

1. Preserve behaviour before improving structure.
2. Prefer consistency over cleverness.
3. Keep migrations small and reviewable.
4. Avoid unnecessary abstractions.
5. Reuse established patterns.
6. Minimize implementation risk.
7. Leave the codebase cleaner than it was found.
8. Build for long-term maintainability.

---

# Future Cleanup

After all business modules have been migrated, a final **Architecture Cleanup** phase will be performed.

This phase will:

- Remove legacy singleton fallbacks.
- Remove temporary compatibility code.
- Eliminate remaining direct `prisma.ts` dependencies.
- Standardize dependency injection across the entire backend.
- Perform a final architectural review before the production release.