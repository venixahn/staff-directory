# Design

## Domain

`db.json` holds three collections:

- `fields` — label, type (`text`, `textarea`, `email`, `phone`, `date`, `select`), required, options, and a `builtin` flag
- `employees` — `id` plus `values` keyed by field id
- `layouts` — one profile layout and one report layout

Builtin fields cannot be deleted: first name, last name, and email. Starter fields can be edited or removed: phone, department, job title, hire date, status (Active or Inactive), and office. The seed file includes about eight employees.

Search compares the query with every text-like value (`text`, `textarea`, `email`, `phone`, `select`).

Deleting a custom field removes it from employee values and from both layouts. If the report sorted or grouped by that field, sort falls back to last name and grouping is cleared.

## HTTP

- `GET /api/employees?q=` lists employees. An empty `q` returns everyone.
- `POST /api/employees` body `{ "values": { "<fieldId>": "..." } }`
- `GET /api/employees/:id`
- `PATCH /api/employees/:id` merges `values`
- `DELETE /api/employees/:id`
- `GET /api/fields`
- `POST /api/fields` creates a custom field and appends it to the profile layout
- `PATCH /api/fields/:id` updates label, type, required, and options. Builtin ids stay fixed.
- `DELETE /api/fields/:id`
- `PUT /api/fields/order` body `{ "ids": ["..."] }` reorders fields
- `GET /api/layouts/profile` and `PUT /api/layouts/profile`
- `GET /api/layouts/report` and `PUT /api/layouts/report`
- `POST /api/pdf/profile/:id` returns `application/pdf`. An optional body `{ "layout": {...} }` renders an unsaved profile layout.
- `POST /api/pdf/report?q=` returns `application/pdf` for the current search. An optional body `{ "layout": {...} }` renders an unsaved report layout.

Both layouts share page size (A4 or Letter), orientation, margins (narrow 24 pt, normal 40 pt, wide 64 pt), title size, and text size. Profile layout adds field order, one or two columns, labels beside or above values, and whether to show empty fields. Report layout adds columns and their order, sort field and direction, optional group-by, and row spacing (compact or comfortable). Layouts saved before these keys existed get the defaults when read.

## Errors

| Tag | Status | When |
| --- | --- | --- |
| `EmployeeNotFound` | 404 | The id is missing |
| `FieldNotFound` | 404 | The field id is missing |
| `BuiltinFieldProtected` | 409 | A builtin field would be deleted or have its id changed |
| `InvalidField` | 400 | Values, options, or the field order are inconsistent |
| Zod parse failure | 400 | The request body does not match the schema |

## PDF

`planProfile` and `planReport` in `@staff/shared` are pure functions. They turn employees, field definitions, and a layout into a `PdfPlan`: page box, title, and blocks (fields, two-column groups, or a table). The server converts the plan to a pdfmake document and renders it to bytes.

The renderer reads spacing from `pdfSpacing`: line height, title gap, column gap, field gaps, and cell padding. Line height is 0.925 of the font size, because pdfmake lays Helvetica lines out at ascender minus descender.
