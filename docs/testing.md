# Testing

Write a failing test locally, make it pass, then commit the test, the code, and the docs update together. Hooks reject a red tree.

## Suites

- **Unit** (`npm run test:unit`) — Vitest. Shared Zod and helpers, server Effect and PDF planning, client RxJS-to-signal bridge.
- **API** (`npm run test:api`) — Vitest and Supertest against a temporary `db.json`.
- **End-to-end** (`npm run test:e2e`) — Playwright, one scenario per user story, plus the shell smoke test. The suite starts its own API on port 3010 against `server/data/e2e.json` and its own UI on port 5174. `STAFF_DB_FRESH=1` makes that API delete the file before it loads, so every run starts from the seed data. `npm run dev` keeps port 3000 and port 5173.

`npm test` runs all three. Before merging a feature branch into `develop`, run `npm test`.

## Coverage

Istanbul reports are separate from `npm test`, so the commit hook stays on the uninstrumented suites.

- **Unit** (`npm run test:coverage:unit`) — Istanbul via Vitest for `@staff/shared`, `@staff/server`, and `@staff/client`. HTML and lcov land in each package's `coverage/unit`.
- **Integration** (`npm run test:coverage:integration`) — the same Supertest API suite, reported to `server/coverage/integration`.
- **End-to-end** (`npm run test:coverage:e2e`) — Playwright with the client instrumented (`VITE_COVERAGE=true`) and the API wrapped in c8. Browser coverage is collected from `window.__coverage__` and reported with nyc to `client/coverage/e2e`. Server coverage is reported to `server/coverage/e2e`.

`npm run test:coverage` runs all three.

## Hooks

- **pre-commit** — `npm run lint`, `npm run typecheck`, and `npm run test:unit`
- **pre-push** — `npm test`

## API fixtures

Each API test creates its own database file and deletes it afterward. Tests do not write `server/data/db.json`.
