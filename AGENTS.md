# AGENTS.md — angular-dashboard-sandbox

## Purpose

Canonical Angular enterprise-admin **completeness slice** (T-2026-224).

This is a B2B admin sandbox (RBAC, dual-control, SSE, audit, charts). It is **not** an event-cms replacement and must stay far below the React event stack.

**Tickets are not tracked in this repo.** Planning SSOT: `platform-command`.

## Before coding

1. Work **here**, not in `nx-playground` `apps/enterprise-admin`.
2. Do not double-write nx leftover + this satellite.
3. Keep new work on the one-page path: login → approval or audit → SSE/charts.

## Quick start

```bash
pnpm install
pnpm start   # http://localhost:4200/slice after login
```

Demo users: `admin/admin`, `manager/manager`, `employee/employee`.

## Forbidden

- Treating `apps/enterprise-admin` as SSOT
- Building an event-cms / event-stack clone
- Independent production deploy claims
- Committing `docs/platform-inbox/` (gitignored local-only path)

## Integration

- Completeness object: this repo
- Mirror inversion leftover: T-228 (later; do not delete nx apps here)
