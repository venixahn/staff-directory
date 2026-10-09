# Changelog

## Unreleased

- Repository scaffold: workspaces, ESLint complexity limit, Husky, Solid and daisyUI shell, Nest process, and this wiki.
- Shared Zod schemas for fields, employees, and PDF layouts, plus seed data, search matching, and value checks.
- Employee API: list, search, read, create, update, and delete against the JSON file.
- Custom fields: create, update, reorder, and delete, including stripping stored values.
- Saved profile and report layouts, with field ids checked against the directory.
- Profile and aggregate PDF downloads rendered from the saved layouts.
- Directory screen with debounced search, plus the employee form.
- Field manager and export screen for saved PDF layouts.
- Directory list reloads after an employee is deleted.
- Playwright coverage for the user stories, using a fresh end-to-end database file.
- Separate Istanbul reports for unit tests, the API integration suite, and end-to-end browser and server runs. End-to-end uses ports 3010 and 5174 so the dev server can stay on 3000 and 5173.
- Fields page reorders by drag and drop.
- End-to-end runs start from fresh seed data. The test API clears its file before loading it, so one run no longer inherits the previous run's changes.
- The row under a dragged field is outlined, so you can see where it will land.
- Directory rows open an employee profile with Edit, Download PDF, and Delete. Deleting an employee or a field asks you to type its name in an in-page dialog, because embedded browsers can skip native confirm prompts.
- Form labels sit above their inputs again. daisyUI 5 dropped the `form-control` class.
- PDF layouts gain page size, margins, title and text size, profile columns and label placement, and report row spacing. PDF endpoints render an unsaved layout sent in the request body.
