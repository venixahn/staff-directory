import { A, Route, Router } from "@solidjs/router"
import type { ParentProps } from "solid-js"
import { DirectoryPage } from "./pages/directory"
import { EmployeeFormPage } from "./pages/employee-form"
import { ExportPage } from "./pages/export"
import { FieldsPage } from "./pages/fields"

export function App() {
  return (
    <Router root={Shell}>
      <Route path="/" component={DirectoryPage} />
      <Route path="/employees/new" component={EmployeeFormPage} />
      <Route path="/employees/:id" component={EmployeeFormPage} />
      <Route path="/fields" component={FieldsPage} />
      <Route path="/export" component={ExportPage} />
    </Router>
  )
}

function Shell(props: ParentProps) {
  return (
    <div class="min-h-screen bg-base-200">
      <nav class="navbar bg-base-100 shadow-sm px-4">
        <A href="/" class="btn btn-ghost text-lg">
          Staff directory
        </A>
        <div class="flex gap-1">
          <A href="/" class="btn btn-ghost">
            Directory
          </A>
          <A href="/fields" class="btn btn-ghost">
            Fields
          </A>
          <A href="/export" class="btn btn-ghost">
            Export
          </A>
        </div>
      </nav>
      <main class="mx-auto max-w-5xl p-6">{props.children}</main>
    </div>
  )
}
