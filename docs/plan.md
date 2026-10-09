# Plan

`staff-directory` is a SolidJS UI and a NestJS API. Employee records live in a JSON file. People can manage custom fields and export individual or aggregate PDFs with a saved layout.

## Packages

- `shared` — Zod schemas and pure helpers used by both apps
- `server` — NestJS, lowdb (`server/data/db.json`), Effect use-cases, pdfmake
- `client` — Vite, SolidJS, Tailwind, daisyUI

`npm run dev` starts Nest on port 3000 and Vite on port 5173. Vite proxies `/api` to Nest.

## Layers

- Zod parses HTTP bodies, query params, and the JSON file.
- Effect runs server use-cases and tagged errors.
- RxJS owns the client search stream.
- Solid signals own view state.
- daisyUI supplies the controls. It is Tailwind-native and works in Solid.

## Quality

- ESLint `complexity` is an error above 8.
- Husky pre-commit runs ESLint and unit tests.
- Husky pre-push runs `npm test` (unit, API, and end-to-end).
- A commit stays green: a failing test is written locally, then the passing test, the code, and the docs update land together.

## Git flow

`main` and `develop` exist from the start. Work lands on `feature/*` branches cut from `develop`, then merges back. `develop` merges into `main` after the browser check.

Branches:

- `feature/tooling`
- `feature/employee-api`
- `feature/fields-and-layouts-api`
- `feature/pdf-api`
- `feature/directory-ui`
- `feature/fields-and-export-ui`
- `feature/e2e`

## Screens

- Directory — search, add, edit, delete, download one profile PDF
- Employee form — generated from field definitions
- Fields — add, edit, reorder, and delete custom fields
- Export — edit saved layouts and download an aggregate PDF of the current search
