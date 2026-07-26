# 12_PROMPT_LIBRARY.md

**Project:** Embroidery Business Management System (EBMS)

**Developer Kit Version:** 1.0

**Document Version:** 1.0

**Status:** Approved

---

# 1. Purpose

This document provides a standardized library of prompts for AI-assisted development of the Embroidery Business Management System (EBMS).

Its goals are to:

* Produce consistent implementations.
* Reduce prompt rewriting.
* Preserve architectural integrity.
* Improve development speed.
* Standardize AI collaboration.

This document complements the AI Development Guide by providing reusable task-specific prompt templates.

---

# 2. General Prompt Template

Every implementation prompt should follow this structure:

```text
Project:
Embroidery Business Management System (EBMS)

Task:
<Describe the feature>

Reference Documents:
- Business Rules
- Feature Specifications
- System Architecture
- Coding Standards

Requirements:
<Business requirements>

Constraints:
<Architecture, naming, security, etc.>

Deliverables:
<Expected output>
```

---

# 3. Architecture Prompt

## Purpose

Design a new module while maintaining architectural consistency.

### Template

```text
You are the Lead Software Architect for EBMS.

Review the existing architecture before making changes.

Requirements:
- Follow the System Architecture document.
- Respect Aggregate boundaries.
- Do not introduce new architectural patterns.
- Explain trade-offs.

Deliver:
- Updated design
- Risks
- Dependencies
```

---

# 4. Backend Implementation Prompt

## Purpose

Implement backend business functionality.

### Template

```text
Implement the requested backend feature.

Follow:

- Business Rules
- Domain Model
- API Specification
- Coding Standards

Requirements:

- Controllers contain no business logic.
- Services contain business rules.
- Repositories handle database access.
- Validate all input.
- Handle errors correctly.
- Include tests.

Return:

- Updated files
- Explanation
- Test cases
```

---

# 5. Database Prompt

## Purpose

Create or modify database models.

### Template

```text
Design the Prisma schema for the requested feature.

Requirements:

- Follow Database Design.
- Preserve referential integrity.
- Use UUIDs.
- Use soft delete where applicable.
- Explain indexes.
- Explain constraints.
- Generate migration considerations.
```

---

# 6. Frontend Prompt

## Purpose

Implement React UI.

### Template

```text
Build the requested React page.

Requirements:

- Follow UI Specification.
- Reuse shared components.
- Keep business logic outside components.
- Implement validation.
- Handle loading and error states.
- Ensure accessibility.

Return:

- Components
- Hooks
- Routing updates
```

---

# 7. API Prompt

## Purpose

Implement REST endpoints.

### Template

```text
Implement the REST API.

Requirements:

- Follow API Specification.
- Use standard response format.
- Validate requests.
- Return appropriate HTTP status codes.
- Include authentication.
- Include authorization.
- Include tests.
```

---

# 8. Testing Prompt

## Purpose

Generate automated tests.

### Template

```text
Write automated tests.

Include:

- Unit Tests
- Integration Tests
- API Tests

Cover:

- Success cases
- Validation failures
- Authorization failures
- Business rule violations
- Edge cases
```

---

# 9. Refactoring Prompt

## Purpose

Improve existing code without changing business behavior.

### Template

```text
Refactor the implementation.

Requirements:

- Preserve behavior.
- Improve readability.
- Remove duplication.
- Maintain API compatibility.
- Do not introduce breaking changes.
```

---

# 10. Bug Fix Prompt

## Purpose

Resolve defects safely.

### Template

```text
Investigate the reported issue.

Deliver:

- Root cause analysis.
- Minimal fix.
- Regression tests.
- Risk assessment.
```

---

# 11. Documentation Prompt

## Purpose

Keep documentation synchronized with implementation.

### Template

```text
Review the implementation.

Identify:

- Documents affected.
- Required updates.
- Missing documentation.
```

---

# 12. Code Review Prompt

## Purpose

Perform a structured code review.

### Checklist

Review:

* Business correctness.
* Architecture compliance.
* Naming consistency.
* Error handling.
* Security.
* Performance.
* Test coverage.
* Documentation.

Summarize findings by priority:

* Critical
* High
* Medium
* Low

````

---

# 13. Performance Review Prompt

## Purpose

Identify performance improvements.

### Template

```text
Review the implementation for performance.

Evaluate:

- Database queries.
- Index usage.
- N+1 query risks.
- API efficiency.
- Rendering performance.
- Memory usage.

Recommend improvements with trade-offs.
````

---

# 14. Security Review Prompt

## Purpose

Evaluate the implementation for security.

### Checklist

Verify:

* Authentication
* Authorization
* Input validation
* SQL injection prevention
* XSS prevention
* Sensitive data handling
* File upload security
* Logging practices

````

---

# 15. Feature Completion Prompt

## Purpose

Verify readiness before merging.

### Template

```text
Review the completed feature.

Confirm:

- Business rules implemented.
- Tests passing.
- Documentation updated.
- Coding standards followed.
- No architectural violations.

Provide:

- Pass / Fail assessment.
- Remaining work.
````

---

# 16. Prompt Usage Guidelines

* Use the smallest prompt that satisfies the task.
* Always reference the relevant project documents.
* Avoid combining unrelated tasks into a single prompt.
* Ask for clarification when requirements are incomplete.
* Keep generated code aligned with established architecture and terminology.

---

# 17. Prompt Maintenance

The prompt library is a living document.

New prompt templates may be added when:

* A recurring development task is identified.
* A new module is introduced.
* Development patterns evolve.

Existing prompts should be updated only when project standards change.

---

# End of Document
