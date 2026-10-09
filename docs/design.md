# Design

## Domain

`db.json` holds three collections:

- `fields` — label, type (`text`, `textarea`, `email`, `phone`, `date`, `select`, `records`), required, options, columns, and a `builtin` flag
- `employees` — `id` plus `values` keyed by field id
- `layouts` — one profile layout and one report layout

Builtin fields cannot be deleted: first name, last name, and email. Starter fields can be edited or removed: phone, department, job title, hire date, status (Active or Inactive), office, and three records fields: Education (school, degree, location, from, to), Employment history (employer, role, location, from, to), and Family members (name, relationship, birth date). The seed file includes about eight employees.

## Records fields

A `records` field holds a list of entries, such as schools or past employers. Its `columns` each have an id, a label, and a type (`text` or `date`). An employee's value for it is an array of entries keyed by column id; every other field stores a string. `textValue` and `recordEntries` in `@staff/shared` read either shape safely.

New columns get an id derived from their label; columns that already exist keep theirs, so renaming a column keeps its data. Removing a column drops that key from every entry. Switching a field between `records` and a scalar type clears its stored values, because one shape cannot be converted to the other.

A required records field needs at least one entry with a value. The form drops blank entries before saving.

Search compares the query with every text-like value (`text`, `textarea`, `email`, `phone`, `select`) and with every value inside records entries.

Deleting a custom field removes it from employee values and from both layouts. If the report sorted or grouped by that field, sort falls back to last name and grouping is cleared.

## HTTP

- `GET /api/employees?q=` lists employees. An empty `q` returns everyone.
- `POST /api/employees` body `{ "values": { "<fieldId>": "..." } }`. Records fields take `[{ "<columnId>": "..." }]`.
- `GET /api/employees/:id`
- `PATCH /api/employees/:id` merges `values`
- `DELETE /api/employees/:id`
- `GET /api/fields`
- `POST /api/fields` creates a custom field and appends it to the profile layout
- `PATCH /api/fields/:id` updates label, type, required, options, and columns. Builtin ids stay fixed.
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
| `InvalidField` | 400 | Values, options, columns, or the field order are inconsistent, or a report layout uses a records field |
| Zod parse failure | 400 | The request body does not match the schema |

## PDF

`planProfile` and `planReport` in `@staff/shared` are pure functions. They turn employees, field definitions, and a layout into a `PdfPlan`: page box, title, and blocks (fields, two-column groups, sections, or a table). Each records field becomes a full-width section: its label over a table of entries. Scalar fields between sections still flow into one or two columns. A section with no entries is left out unless the layout shows empty fields. Records fields cannot be report columns, sort keys, or groups. The server converts the plan to a pdfmake document and renders it to bytes. The client draws the same plan as a page-sized canvas, scaled from points to pixels, so what you edit is what you download.

Both renderers read spacing from `pdfSpacing`: line height, title gap, column gap, field gaps, section gaps, and cell padding. Line height is 0.925 of the font size, because pdfmake lays Helvetica lines out at ascender minus descender. Field gaps are padding on the canvas, because pdfmake adds neighbouring margins instead of collapsing them.

The designer screens are `/employees/:id/pdf` (one profile) and `/export` (report of the current search). On the canvas you rename the title in place, drag fields or column headings to reorder them, and hover a field to hide it. Hidden fields appear as `+ Field` chips. The toolbar holds the paper and layout settings. Download sends the draft; Save as default layout stores it; Reset returns to the saved layout.
