# AGENTS.md — MoneyBags Agent Guide

This file is the **table of contents** for AI agents working in this repository. It is intentionally brief. Follow the links below to find detailed context for your task. Do not attempt to hold the entire project in context — load only what is relevant to your current task.

## Core Principle

No manually-written application code. Humans design environments, write specs, and review outputs. Agents implement. When an agent struggles, the harness is missing something — update the docs, not just the code.

---

## Where to Start

| What you're doing | Read this |
|---|---|
| Understanding the product | [SPEC.md](./SPEC.md) → [docs/PRODUCT_SENSE.md](./docs/PRODUCT_SENSE.md) |
| Understanding the architecture | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Writing frontend code | [docs/FRONTEND.md](./docs/FRONTEND.md) + [docs/DESIGN.md](./docs/DESIGN.md) |
| Working on a feature | [docs/product-specs/index.md](./docs/product-specs/index.md) |
| Executing a plan | [docs/exec-plans/active/](./docs/exec-plans/active/) |
| Understanding a subsystem | [docs/design-docs/index.md](./docs/design-docs/index.md) |
| Checking quality bar | [docs/QUALITY_SCORE.md](./docs/QUALITY_SCORE.md) |
| Security concerns | [docs/SECURITY.md](./docs/SECURITY.md) |
| Reliability concerns | [docs/RELIABILITY.md](./docs/RELIABILITY.md) |

---

## Repository Layout

```
moneybags/
├── AGENTS.md              ← You are here
├── ARCHITECTURE.md        ← Layer map, dependency rules
├── SPEC.md                ← Full product spec
├── docs/
│   ├── DESIGN.md          ← Visual design system
│   ├── FRONTEND.md        ← Frontend conventions
│   ├── PLANS.md           ← High-level roadmap
│   ├── PRODUCT_SENSE.md   ← Product vision & principles
│   ├── QUALITY_SCORE.md   ← Quality standards
│   ├── RELIABILITY.md     ← Reliability standards
│   ├── SECURITY.md        ← Security rules
│   ├── design-docs/       ← Subsystem design documents
│   ├── exec-plans/        ← Active and completed execution plans
│   ├── generated/         ← Auto-generated reference docs
│   ├── product-specs/     ← Per-feature product specs
│   └── references/        ← External library/API references
├── src/
│   ├── app/               ← Next.js App Router pages
│   ├── components/        ← Shared UI components
│   ├── engine/            ← Simulation engine (pure logic, no UI)
│   ├── data/              ← Static historical datasets
│   ├── store/             ← Zustand state management
│   ├── hooks/             ← Custom React hooks
│   ├── lib/               ← Utilities (math, formatting, etc.)
│   └── types/             ← TypeScript types (no imports from other src/)
└── public/
    └── data/              ← Static JSON price data files
```

---

## Agent Rules

1. **Read before writing.** Always read the relevant spec and design doc before implementing.
2. **Types first.** Define or update types in `src/types/` before implementing logic.
3. **Engine is pure.** `src/engine/` must have zero React/UI imports. Pure TypeScript functions only.
4. **No `any`.** TypeScript strict mode is enforced. No `any` types.
5. **Mobile first.** All UI is built for 375px width first. Desktop is an enhancement.
6. **Dark mode only.** No light mode code. Use design tokens from `docs/DESIGN.md`.
7. **No manually-written price data.** Historical data lives in `public/data/` and is sourced per the data schema.
8. **Check exec-plans first.** Before starting work, check `docs/exec-plans/active/` for the current plan.
9. **Update docs when adding subsystems.** If you add a new subsystem, add a design doc for it.
10. **Mark plans complete.** When an exec plan phase is done, move it from `active/` to `completed/`.

---

## Dependency Layer Rules

Imports must flow in this direction only:

```
types → lib → data → engine → store → hooks → components → app
```

Violations are caught by structural tests. Do not work around them.

---

## Current Status

See [docs/exec-plans/active/phase-1-scaffold.md](./docs/exec-plans/active/phase-1-scaffold.md) for what's being built now.
