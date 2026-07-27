# 10_AI_DEVELOPMENT_GUIDE.md

**Project:** Embroidery Business Management System (EBMS)

**Developer Kit Version:** 1.0

**Document Version:** 1.0

**Status:** Approved

---

# 1. Purpose

This document defines how Artificial Intelligence (AI) tools should be used during the development of the Embroidery Business Management System (EBMS).

Its purpose is to ensure that AI-generated code remains consistent with the project's architecture, business rules, and coding standards.

AI is treated as a development assistant, not an autonomous decision maker.

---

# 2. Guiding Principles

## AI-001 Architecture Before Code

AI must always follow the documented architecture.

If an implementation request conflicts with the architecture documents, the architecture takes precedence.

---

## AI-002 Business Rules Are Mandatory

AI must not change or bypass business rules.

Every implementation must comply with:

* Business Rules
* Domain Model
* API Specification
* Database Design

---

## AI-003 No Assumptions

If required business information is missing, AI should request clarification rather than invent behavior.

---

## AI-004 Preserve Existing Patterns

When extending the project, AI should reuse established structures, naming conventions, and implementation patterns.

Avoid introducing new architectural styles unless explicitly approved.

---

# 3. Development Workflow

EBMS uses a Vertical Slice development approach. Each module is implemented as a complete, end-to-end slice before moving to the next.

For every implementation request, AI should follow this sequence:

```text
Understand Requirement
        ↓
Identify Related Documents
(Business Rules → Feature Spec → Domain Model → Architecture → ADR Index)
        ↓
Review Existing Code
        ↓
Design Prisma Schema for This Module
        ↓
Implement Backend
(routes → controller → service → repository → validator)
        ↓
Implement Frontend
(page → components → hooks → API client)
        ↓
Write Tests
(unit → integration → API)
        ↓
Self-Review
(Architecture Checklist + ADR Compliance)
        ↓
Deliver (Backend + Frontend + Tests together)
```

Do not deliver backend-only or frontend-only partial modules. Each module is considered complete only when Backend, Frontend, and Tests are all present.

Implementation should never begin before understanding the business requirement.

---

# 4. Document Priority

When multiple documents are relevant, they should be consulted in the following order:

1. ADR Index (13_ADR_INDEX.md) — for architectural decisions
2. Business Rules (02_BUSINESS_RULES.md)
3. Feature Specifications (03_FEATURE_SPECIFICATIONS/)
4. Domain Model (04A_DOMAIN_MODEL.md)
5. System Architecture (04_SYSTEM_ARCHITECTURE.md)
6. Database Design (06_DATABASE_DESIGN.md)
7. API Specification (07_API_SPECIFICATION.md)
8. UI Specification (08_UI_SPECIFICATION.md)
9. Coding Standards (09_CODING_STANDARDS.md)

If conflicts arise, higher-priority documents take precedence.

---

# 5. Feature Implementation Checklist

Before generating code for any module, AI must confirm:

* Which business module is affected?
* Which aggregate owns the change?
* Which business rules apply? (02_BUSINESS_RULES.md)
* Are there relevant ADRs? (13_ADR_INDEX.md)
* What Prisma schema changes does this module require?
* Has the schema design been reviewed before implementation begins?
* Is the schema consistent with existing tables and 06_DATABASE_DESIGN.md principles?
* Which API endpoints are involved? (07_API_SPECIFICATION.md)
* Which database entities are affected?
* What is the Archive / status policy for this entity? (BR-802)
* What tests are required?

Implementation must proceed only after these questions are answered.

---

# 6. Code Generation Rules

AI-generated code should:

* Follow the project folder structure.
* Use approved naming conventions.
* Keep business logic in services.
* Keep controllers lightweight.
* Use repositories for database access.
* Avoid duplicated logic.
* Prefer composition over duplication.

---

# 7. Modification Rules

When modifying existing code:

* Preserve backward compatibility where possible.
* Minimize unrelated changes.
* Explain significant design decisions.
* Update documentation if business behavior changes.

---

# 8. Testing Expectations

Every feature should include appropriate tests.

Preferred order:

1. Unit tests
2. Integration tests
3. API tests
4. End-to-end tests (when applicable)

AI should not consider a feature complete without corresponding tests.

---

# 9. Error Handling

AI should:

* Use project-specific exception types.
* Return standardized API responses.
* Preserve meaningful error messages.
* Avoid exposing internal implementation details.

---

# 10. Security Expectations

AI must:

* Validate all external input.
* Enforce authorization checks.
* Avoid logging sensitive information.
* Prevent common security vulnerabilities where applicable.

Security should never be treated as an optional enhancement.

---

# 11. Documentation Updates

Whenever business behavior changes, AI should identify which documents require updates.

Potential updates include:

* Feature Specifications
* API Specification
* Database Design
* UI Specification

Documentation should remain synchronized with implementation.

---

# 12. AI Limitations

AI should not:

* Invent undocumented business rules.
* Rename established business terminology.
* Introduce new dependencies without justification.
* Refactor unrelated modules during feature work.
* Make architectural decisions without consulting 13_ADR_INDEX.md first.
* Implement new architectural patterns without recording an ADR.

When uncertain, AI should state the uncertainty explicitly and ask for clarification.

---

# 13. Review Checklist

Before presenting generated code, AI should verify:

* Business rules followed.
* Architecture respected.
* Naming conventions consistent.
* Tests included.
* Error handling implemented.
* Security considered.
* No unnecessary complexity introduced.

---

# 14. Collaboration Guidelines

AI should work collaboratively with human developers by:

* Explaining important implementation decisions.
* Highlighting trade-offs.
* Pointing out potential risks.
* Asking for clarification when requirements are incomplete.

The final architectural and business decisions remain with the development team.

---

# 15. Success Criteria

AI assistance is considered successful when it:

* Produces maintainable code.
* Preserves architectural consistency.
* Respects business rules.
* Reduces development effort.
* Improves overall code quality.

---

# End of Document
