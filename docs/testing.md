# Testing

Write a failing test locally, make it pass, then commit the test, the code, and the docs update together. Hooks reject a red tree.

## Suites

- **Unit** (`npm run test:unit`) — Vitest. Shared Zod and helpers, server Effect and PDF planning, client RxJS-to-signal bridge.
- **API** (`npm run test:api`) — Vitest and Supertest against a temporary `db.json`.
- **End-to-end** (`npm run test:e2e`) — Playwright, one scenario per user story, plus the shell smoke test.

`npm test` runs all three. Before merging a feature branch into `develop`, run `npm test`.

## Hooks

- **pre-commit** — `npm run lint` and `npm run test:unit`
- **pre-push** — `npm test`

## API fixtures

Each API test creates its own database file and deletes it afterward. Tests do not write `server/data/db.json`.
