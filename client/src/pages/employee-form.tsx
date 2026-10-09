import type { Field } from "@staff/shared"
import { A, useNavigate, useParams } from "@solidjs/router"
import { createSignal, For, onMount, Show } from "solid-js"
import { createEmployee, getEmployee, listFields, updateEmployee } from "../api"

export function EmployeeFormPage() {
  const params = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const [fields, setFields] = createSignal<Field[]>([])
  const [values, setValues] = createSignal<Record<string, string>>({})
  const [error, setError] = createSignal("")
  const editing = () => Boolean(params.id)

  onMount(() => {
    void loadForm()
  })

  async function loadForm() {
    try {
      const nextFields = await listFields()
      setFields(nextFields)
      if (!params.id) {
        setValues(blankValues(nextFields))
        return
      }
      const employee = await getEmployee(params.id)
      setValues(employee.values)
    } catch (cause) {
      setError(messageOf(cause))
    }
  }

  function setValue(id: string, value: string) {
    setValues({ ...values(), [id]: value })
  }

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault()
    try {
      const saved = params.id ? await updateEmployee(params.id, values()) : await createEmployee(values())
      navigate(`/employees/${saved.id}`)
    } catch (cause) {
      setError(messageOf(cause))
    }
  }

  return (
    <section>
      <h1 class="mb-4 text-2xl font-semibold">{editing() ? "Edit employee" : "Add employee"}</h1>
      <Show when={error()}>
        <p class="alert alert-error mb-4">{error()}</p>
      </Show>
      <form class="card bg-base-100 shadow-sm" onSubmit={(event) => void onSubmit(event)}>
        <div class="card-body grid gap-4">
          <For each={fields()}>
            {(field) => (
              <label class="flex flex-col gap-1">
                <span class="label-text">
                  {field.label}
                  {field.required ? " *" : ""}
                </span>
                <FieldControl field={field} value={values()[field.id] ?? ""} onChange={(value) => setValue(field.id, value)} />
              </label>
            )}
          </For>
          <div class="flex gap-2">
            <button class="btn btn-primary" type="submit">
              Save
            </button>
            <A class="btn" href={params.id ? `/employees/${params.id}` : "/"}>
              Cancel
            </A>
          </div>
        </div>
      </form>
    </section>
  )
}

function FieldControl(props: { field: Field; value: string; onChange: (value: string) => void }) {
  if (props.field.type === "textarea") {
    return (
      <textarea
        class="textarea textarea-bordered w-full"
        value={props.value}
        onInput={(event) => props.onChange(event.currentTarget.value)}
      />
    )
  }
  if (props.field.type === "select") return <SelectControl {...props} />
  return (
    <input
      class="input input-bordered w-full"
      type={inputType(props.field.type)}
      value={props.value}
      onInput={(event) => props.onChange(event.currentTarget.value)}
    />
  )
}

function SelectControl(props: { field: Field; value: string; onChange: (value: string) => void }) {
  return (
    <select
      class="select select-bordered w-full"
      value={props.value}
      onChange={(event) => props.onChange(event.currentTarget.value)}
    >
      <For each={props.field.options ?? []}>{(option) => <option value={option}>{option}</option>}</For>
    </select>
  )
}

function inputType(type: Field["type"]) {
  if (type === "email") return "email"
  if (type === "phone") return "tel"
  if (type === "date") return "date"
  return "text"
}

function blankValues(fields: Field[]) {
  const values: Record<string, string> = {}
  for (const field of fields) values[field.id] = defaultValue(field)
  return values
}

function defaultValue(field: Field) {
  if (field.type === "select") return field.options?.[0] ?? ""
  return ""
}

function messageOf(cause: unknown) {
  return cause instanceof Error ? cause.message : "Something went wrong"
}
