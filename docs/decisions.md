# Decisions

## Zod

Request bodies and `db.json` are parsed with Zod schemas in `@staff/shared`. Server code after that boundary receives parsed types. One schema package keeps the UI and the API aligned.

## Effect

Server use-cases are Effect programs. Failures are tagged errors (`EmployeeNotFound`, `FieldNotFound`, `BuiltinFieldProtected`, `InvalidField`). lowdb reads and writes run inside an Effect semaphore so JSON writes do not interleave. Nest controllers call `Effect.runPromise` and map tags to HTTP statuses.

## RxJS and Solid signals

The search box is an Observable: debounce, distinct until changed, then switch to the latest request. A bridge writes the latest rows into a Solid signal and returns an unsubscribe function. Components read signals. They do not call Effect and they do not subscribe to RxJS themselves.

## daisyUI

Tailwind is required, and daisyUI is a Tailwind component library that works in Solid. Buttons, tables, inputs, selects, and the navbar come from daisyUI classes.

## lowdb

The database is a single JSON file through lowdb. That matches a local staff directory without a separate database server.

## pdfmake

pdfmake turns a declarative document definition into PDF bytes. The planner is a pure function, so layout rules can be unit tested without rendering.

## Complexity limit 8

ESLint's built-in `complexity` rule fails above 8. That is cyclomatic complexity. Functions stay small instead of disabling the rule.

## Git flow and green commits

`main` is the finished line. `develop` integrates feature branches. Each commit is one behavior and includes its docs update. The pre-commit hook runs unit tests, so the committed tree is green.
