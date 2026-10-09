import type { Employee } from "@staff/shared"
import { A, useNavigate } from "@solidjs/router"
import { createSignal, For, onCleanup, onMount, Show } from "solid-js"
import { Subject } from "rxjs"
import { listEmployees } from "../api"
import { displayName, messageOf } from "../employee-name"
import { bindSearch } from "../search"
import { directoryQuery, setDirectoryQuery } from "../state"

export function DirectoryPage() {
  const navigate = useNavigate()
  const [rows, setRows] = createSignal<Employee[]>([])
  const [error, setError] = createSignal("")
  const query$ = new Subject<string>()

  onMount(() => {
    const stop = bindSearch(
      query$,
      (query) =>
        listEmployees(query).catch((cause: unknown) => {
          setError(messageOf(cause))
          return rows()
        }),
      (employees) => setRows(employees),
    )
    query$.next(directoryQuery())
    onCleanup(() => {
      stop()
      query$.complete()
    })
  })

  function onSearch(value: string) {
    setDirectoryQuery(value)
    setError("")
    query$.next(value)
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
            </tr>
          </thead>
          <tbody>
            <For each={rows()} fallback={<tr><td colspan="4">No employees match this search.</td></tr>}>
              {(employee) => (
                <tr class="hover:bg-base-200 cursor-pointer" onClick={() => navigate(`/employees/${employee.id}`)}>
                  <td>
                    <A class="link link-hover font-medium" href={`/employees/${employee.id}`}>
                      {displayName(employee)}
                    </A>
                  </td>
                  <td>{employee.values.email}</td>
                  <td>{employee.values.department}</td>
                  <td>{employee.values.jobTitle}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </section>
  )
}
