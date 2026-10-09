import type { Employee } from "@staff/shared"
import { A } from "@solidjs/router"
import { createSignal, For, onCleanup, onMount, Show } from "solid-js"
import { Subject } from "rxjs"
import { downloadPdf, listEmployees, removeEmployee } from "../api"
import { bindSearch } from "../search"
import { directoryQuery, setDirectoryQuery } from "../state"

export function DirectoryPage() {
  const [rows, setRows] = createSignal<Employee[]>([])
  const [error, setError] = createSignal("")
  const query$ = new Subject<string>()

  onMount(() => {
    const stop = bindSearch(query$, listEmployees, (employees) => {
      setRows(employees)
      setError("")
    })
    query$.next(directoryQuery())
    onCleanup(() => {
      stop()
      query$.complete()
    })
  })

  function onSearch(value: string) {
    setDirectoryQuery(value)
    query$.next(value)
  }

  async function onDelete(employee: Employee) {
    if (!confirm(`Delete ${displayName(employee)}?`)) return
    try {
      await removeEmployee(employee.id)
      setRows(await listEmployees(directoryQuery()))
    } catch (cause) {
      setError(messageOf(cause))
    }
  }

  return (
    <section>
      <header class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-2xl font-semibold">Directory</h1>
        <A href="/employees/new" class="btn btn-primary">
          Add employee
        </A>
      </header>
      <input
        class="input input-bordered mb-4 w-full"
        aria-label="Search employees"
        placeholder="Search name, email, department, or job title"
        value={directoryQuery()}
        onInput={(event) => onSearch(event.currentTarget.value)}
      />
      <Show when={error()}>
        <p class="alert alert-error mb-4">{error()}</p>
      </Show>
      <div class="overflow-x-auto rounded-box bg-base-100 shadow-sm">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Job title</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <For each={rows()} fallback={<tr><td colspan="5">No employees match this search.</td></tr>}>
              {(employee) => <DirectoryRow employee={employee} onDelete={() => void onDelete(employee)} />}
            </For>
          </tbody>
        </table>
      </div>
    </section>
  )
}

function DirectoryRow(props: { employee: Employee; onDelete: () => void }) {
  return (
    <tr>
      <td>{displayName(props.employee)}</td>
      <td>{props.employee.values.email}</td>
      <td>{props.employee.values.department}</td>
      <td>{props.employee.values.jobTitle}</td>
      <td class="flex flex-wrap gap-2">
        <A class="btn btn-sm" href={`/employees/${props.employee.id}`}>
          Edit
        </A>
        <button class="btn btn-sm" type="button" onClick={() => void downloadProfile(props.employee)}>
          PDF
        </button>
        <button class="btn btn-sm btn-error btn-outline" type="button" onClick={props.onDelete}>
          Delete
        </button>
      </td>
    </tr>
  )
}

async function downloadProfile(employee: Employee) {
  await downloadPdf(`/api/pdf/profile/${employee.id}`, `${displayName(employee)}.pdf`)
}

function displayName(employee: Employee) {
  return `${employee.values.firstName ?? ""} ${employee.values.lastName ?? ""}`.trim()
}

function messageOf(cause: unknown) {
  return cause instanceof Error ? cause.message : "Something went wrong"
}
