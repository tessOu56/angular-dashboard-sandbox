# AGENTS.md — angular-dashboard-sandbox

## Purpose

Angular enterprise dashboard **mirror**. Development in **nx-playground** `apps/enterprise-admin`.

**Tickets are not tracked in this repo.**

## Before coding

1. Prefer working in **nx-playground** `apps/enterprise-admin` instead of this repo.
2. This repo may keep standalone Playwright E2E for practice.
3. Read [`docs/PROJECT-PLAN.md`](docs/PROJECT-PLAN.md) for mirror rules.

## Quick start

```bash
pnpm install
pnpm start   # http://localhost:4200
```

## Forbidden

- New product features in this repo (use nx-playground)
- Independent deploy
- Committing `docs/platform-inbox/` (gitignored local-only path)

## Integration

- Sync source: `nx-playground/apps/enterprise-admin`
- Charts: `nx-playground/libs/charts`
