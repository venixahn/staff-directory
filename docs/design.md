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
- `POST /api/pdf/profile/:id` returns `application/pdf`
- `POST /api/pdf/report?q=` returns `application/pdf` for the current search

Profile layout: title, field order, whether to show empty fields, portrait or landscape. Report layout: title, columns and order, sort field and direction, optional group-by, portrait or landscape.

## Errors

| Tag | Status | When |
| --- | --- | --- |
| `EmployeeNotFound` | 404 | The id is missing |
| `FieldNotFound` | 404 | The field id is missing |
| `BuiltinFieldProtected` | 409 | A builtin field would be deleted or have its id changed |
| `InvalidField` | 400 | Values, options, or the field order are inconsistent |
| Zod parse failure | 400 | The request body does not match the schema |

## PDF

A pure planner builds a pdfmake document definition from the employee rows, field definitions, and saved layout. The Nest adapter renders that definition to bytes. There is no drag-and-drop designer.
