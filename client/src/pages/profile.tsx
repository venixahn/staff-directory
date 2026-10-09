import { isRecords, textValue, type Employee, type Field } from "@staff/shared"
import { A, useNavigate, useParams } from "@solidjs/router"
import { createSignal, For, onMount, Show } from "solid-js"
import { getEmployee, listFields, removeEmployee } from "../api"
import { ConfirmDialog } from "../confirm-dialog"
import { displayName, messageOf } from "../employee-name"
import { RecordsTable } from "../records-table"

export function ProfilePage() {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [employee, setEmployee] = createSignal<Employee | null>(null)
  const [fields, setFields] = createSignal<Field[]>([])
  const [confirming, setConfirming] = createSignal(false)
  const [error, setError] = createSignal("")

  onMount(() => {
    void load()
  })

  async function load() {
    try {
      const [nextEmployee, nextFields] = await Promise.all([getEmployee(params.id), listFields()])
      setEmployee(nextEmployee)
      setFields(nextFields)
    } catch (cause) {
      setError(messageOf(cause))
    }
  }

  async function onDelete(current: Employee) {
    try {
      await removeEmployee(current.id)
      navigate("/")
    } catch (cause) {
      setConfirming(false)
      setError(messageOf(cause))
    }
  }

  return (
    <section class="grid gap-4">
      <A href="/" class="link link-hover w-fit text-sm">
        ← Directory
      </A>
      <Show when={error()}>
        <p class="alert alert-error">{error()}</p>
      </Show>
      <Show when={employee()} keyed>
        {(current) => (
          <>
            <header class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 class="text-2xl font-semibold">{displayName(current)}</h1>
                <p class="opacity-70">{subtitle(current)}</p>
              </div>
              <div class="flex flex-wrap gap-2">
                <A class="btn" href={`/employees/${current.id}/edit`}>
                  Edit
                </A>
                <A class="btn" href={`/employees/${current.id}/pdf`}>
                  Download PDF
                </A>
                <button class="btn btn-error btn-outline" type="button" onClick={() => setConfirming(true)}>
                  Delete
                </button>
              </div>
            </header>
            <dl class="card bg-base-100 shadow-sm">
              <div class="card-body grid gap-3 sm:grid-cols-[12rem_1fr]">
                <For each={fields().filter((field) => !isRecords(field))}>
                  {(field) => (
                    <>
                      <dt class="font-medium opacity-70">{field.label}</dt>
                      <dd>{textValue(current.values, field.id) || "—"}</dd>
                    </>
                  )}
                </For>
              </div>
            </dl>
            <For each={fields().filter(isRecords)}>{(field) => <RecordsTable field={field} values={current.values} />}</For>
            <Show when={confirming()}>
              <ConfirmDialog
                title={`Delete ${displayName(current)}?`}
                confirmText={displayName(current)}
                actionLabel="Delete employee"
                onConfirm={() => void onDelete(current)}
                onCancel={() => setConfirming(false)}
              >
                <p>This permanently removes the profile and every value stored on it. It cannot be undone.</p>
              </ConfirmDialog>
            </Show>
          </>
        )}
      </Show>
    </section>
  )
}

function subtitle(employee: Employee) {
  return [textValue(employee.values, "jobTitle"), textValue(employee.values, "department")].filter((part) => part).join(" · ")
}
