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
- Husky pre-commit runs ESLint, the TypeScript check, and unit tests.
- Husky pre-push runs `npm test` (unit, API, and end-to-end).
- A commit stays green: a failing test is written locally, then the passing test, the code, and the docs update land together.

## Git flow

`main` and `develop` exist from the start. Work lands on `feature/*` branches cut from `develop`, then merges back with `--no-ff`.

`develop` never merges straight into `main`. A release goes through a release branch:

1. After the browser check, cut `release/x.y.z` from `develop`.
2. On that branch, set `x.y.z` in every `package.json` and the lock file (`npm version x.y.z --workspaces --include-workspace-root --no-git-tag-version`, then `npm install --package-lock-only`), and move the changelog's Unreleased entries under a dated `x.y.z` heading. Only release fixes land here.
3. Merge the release branch into `main` with `--no-ff` and tag that merge `vx.y.z` (annotated).
4. Merge the release branch back into `develop` with `--no-ff`, then delete it.

Urgent fixes to a release go on `hotfix/x.y.z` cut from `main`, finished the same way: merge into `main`, tag, merge into `develop`, delete.

Branches:

- `feature/tooling`
- `feature/employee-api`
- `feature/fields-and-layouts-api`
- `feature/pdf-api`
- `feature/directory-ui`
- `feature/fields-and-export-ui`
- `feature/e2e`

## Screens

- Directory — search and add; clicking a row opens the profile
- Profile — every field for one employee, with a table for each records field, and Edit, Download PDF, and Delete (typed-name confirmation)
- Profile PDF — WYSIWYG designer for one employee's PDF; download the draft or save it as the default layout
- Employee form — generated from field definitions; records fields add and remove entries
- Fields — add, edit, drag to reorder, and delete custom fields (typed-label confirmation); records fields define their columns
- Report PDF — WYSIWYG designer for the aggregate PDF of a search; download the draft or save it as the default layout
