# AI_ENGINEERING_GUIDE.md
> Engineering Rules & Development Standards
Version: 1.0

---

# Purpose

This document defines the engineering standards that every AI model (Claude, Gemini, ChatGPT, or future models) must follow while contributing to this project.

These rules exist to ensure that the project remains maintainable, scalable, consistent, and production-ready.

This document complements PROJECT_CONTEXT.md.

PROJECT_CONTEXT explains **what** we are building.

This document explains **how** it must be built.

---

# General Rules

Treat this project as production software.

Never treat it like a tutorial project.

Never generate unnecessary code.

Never over-engineer.

Never under-engineer.

Always optimize for readability and maintainability.

---

# Development Philosophy

The software should be:

Simple

Professional

Scalable

Maintainable

Predictable

Every engineering decision should support these goals.

---

# Backend Rules

The backend already exists.

Never redesign backend APIs.

Never invent new endpoints.

Never modify backend architecture.

Never assume missing APIs.

If a required endpoint does not exist,
mention it instead of inventing one.

Frontend must adapt to backend.

Not vice versa.

---

# Architecture Rules

Use Feature-Based Architecture.

Every feature should be isolated.

Example

features/

customers/

orders/

payments/

dashboard/

Each feature should own:

components

hooks

api

types

pages

validation

utilities (if feature specific)

---

# Shared Code

Reusable code belongs in shared folders.

Never duplicate components.

Never duplicate hooks.

Never duplicate utility functions.

Never duplicate validation logic.

---

# Components

Keep components focused.

One component should solve one problem.

Avoid giant components.

Prefer composition over complexity.

Separate:

UI

Business Logic

API Calls

---

# React Rules

Use Functional Components.

Use Hooks.

Avoid unnecessary re-renders.

Use memoization only when beneficial.

Do not optimize prematurely.

---

# State Management

Server State

TanStack Query

Client UI State

React Hooks

Only introduce global state if absolutely necessary.

Avoid unnecessary Context usage.

---

# Forms

Use:

React Hook Form

Zod

Every form should include:

Validation

Helpful error messages

Loading state

Disabled submit while processing

Success feedback

---

# API Layer

Never call Axios directly inside components.

Always use API service files.

Example

features/orders/api/

orders.api.ts

---

# Error Handling

Every request must handle:

Loading

Success

Error

Empty State

Unexpected Error

Unauthorized

Do not ignore edge cases.

---

# Loading UX

Avoid blank screens.

Prefer:

Skeletons

Loading placeholders

Progress indicators

---

# Tables

Tables should support:

Search

Sorting

Pagination (when necessary)

Responsive layout

Empty state

Loading state

---

# Dialogs

Dialogs should:

Trap focus

Support keyboard interaction

Close safely

Avoid accidental destructive actions

---

# Responsive Design

Desktop-first.

Mobile-friendly.

Tablet supported.

Never hide critical functionality on mobile.

Adapt layout instead.

---

# Accessibility

Use semantic HTML.

Support keyboard navigation.

Maintain sufficient color contrast.

Provide accessible labels.

Do not rely only on color.

---

# Theme

Support:

Light

Dark

System

Never hardcode colors.

Always use theme tokens.

---

# Styling

Use Tailwind CSS.

Use shadcn/ui components whenever possible.

Avoid unnecessary custom CSS.

Prefer utility classes.

Maintain spacing consistency.

---

# Icons

Use Lucide React.

Keep icon usage consistent.

Do not mix icon libraries.

---

# Animations

Animations should be subtle.

Purpose:

Guide attention.

Provide feedback.

Improve perceived quality.

Never distract users.

---

# Notifications

Use Sonner.

Messages should be:

Short

Clear

Actionable

---

# TypeScript

Avoid any.

Use strict typing.

Reuse shared types.

Prefer interfaces for public objects.

Use type aliases where appropriate.

---

# Naming

Components

PascalCase

Hooks

useSomething

Files

kebab-case where appropriate

Constants

UPPER_CASE

Variables

camelCase

Types

PascalCase

---

# Code Quality

Prioritize readability.

Meaningful naming.

Small functions.

Avoid deeply nested logic.

Extract reusable logic.

No dead code.

No commented-out code.

---

# Comments

Do not comment obvious code.

Comment business rules.

Comment non-obvious decisions.

Explain why.

Not what.

---

# Git

Small commits.

Meaningful commit messages.

One feature per commit.

Never mix unrelated changes.

---

# Testing Philosophy

Write code that is testable.

Avoid tightly coupled logic.

Separate business logic from presentation.

---

# Performance

Optimize only when necessary.

Avoid premature optimization.

Measure before optimizing.

---

# Documentation

When introducing:

New architecture

New patterns

Complex business logic

Update documentation.

Documentation is part of the project.

---

# UI Philosophy

This application is not an admin template.

This application is a business tool.

Every screen should answer:

"What is the user trying to accomplish?"

Instead of:

"What information can we display?"

---

# Product Rule

Every new feature must answer:

Which business problem does this solve?

If the answer is unclear,

the feature probably should not exist.

---

# AI Behavior Rules

Never invent requirements.

Never remove existing functionality.

Never refactor architecture without reason.

Explain major engineering decisions.

If multiple approaches exist,

recommend the best one and explain why.

Always think like a senior software engineer.

---

END OF DOCUMENT