import type { Field, FieldDraft, FieldType } from "@staff/shared"
import { createSignal, For, onMount, Show } from "solid-js"
import { createField, listFields, removeField, reorderFields, updateField } from "../api"
import { moveId } from "../order"

const emptyDraft: FieldDraft = { label: "", type: "text", required: false }

export function FieldsPage() {
  const [fields, setFields] = createSignal<Field[]>([])
  const [draft, setDraft] = createSignal<FieldDraft>(emptyDraft)
  const [optionsText, setOptionsText] = createSignal("")
  const [editingId, setEditingId] = createSignal<string | null>(null)
  const [error, setError] = createSignal("")

  onMount(() => {
    void refresh()
  })

  async function refresh() {
    setFields(await listFields())
  }

  function beginEdit(field: Field) {
    setEditingId(field.id)
    setDraft({ label: field.label, type: field.type, required: field.required, options: field.options })
    setOptionsText(field.options?.join(", ") ?? "")
  }

  function resetForm() {
    setEditingId(null)
    setDraft(emptyDraft)
    setOptionsText("")
  }

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault()
    try {
      await saveDraft(editingId(), draftFrom(draft(), optionsText()))
      resetForm()
      await refresh()
    } catch (cause) {
      setError(messageOf(cause))
    }
  }

  async function onDelete(field: Field) {
    if (!confirm(`Delete ${field.label}?`)) return
    try {
      await removeField(field.id)
      await refresh()
    } catch (cause) {
      setError(messageOf(cause))
    }
  }

  async function onMove(id: string, direction: -1 | 1) {
    await reorderFields(moveId(fields().map((field) => field.id), id, direction))
    await refresh()
  }

  return (
    <section class="grid gap-6">
      <h1 class="text-2xl font-semibold">Fields</h1>
      <Show when={error()}>
        <p class="alert alert-error">{error()}</p>
      </Show>
      <form class="card bg-base-100 shadow-sm" onSubmit={(event) => void onSubmit(event)}>
        <div class="card-body grid gap-3 md:grid-cols-2">
          <h2 class="md:col-span-2 text-lg font-medium">{editingId() ? "Edit field" : "Add field"}</h2>
          <input
            class="input input-bordered"
            aria-label="Field label"
            placeholder="Label"
            value={draft().label}
            onInput={(event) => setDraft({ ...draft(), label: event.currentTarget.value })}
          />
          <select
            class="select select-bordered"
            aria-label="Field type"
            value={draft().type}
            onChange={(event) => setDraft({ ...draft(), type: event.currentTarget.value as FieldType })}
          >
            <For each={fieldTypes}>{(type) => <option value={type}>{type}</option>}</For>
          </select>
          <Show when={draft().type === "select"}>
            <input
              class="input input-bordered md:col-span-2"
              aria-label="Field options"
              placeholder="Options, separated by commas"
              value={optionsText()}
              onInput={(event) => setOptionsText(event.currentTarget.value)}
            />
          </Show>
          <label class="label cursor-pointer justify-start gap-2">
            <input
              class="checkbox"
              type="checkbox"
              checked={draft().required}
              onChange={(event) => setDraft({ ...draft(), required: event.currentTarget.checked })}
            />
            Required
          </label>
          <div class="flex gap-2">
            <button class="btn btn-primary" type="submit">
              {editingId() ? "Update field" : "Add field"}
            </button>
            <Show when={editingId()}>
              <button class="btn" type="button" onClick={resetForm}>
                Cancel
              </button>
            </Show>
          </div>
        </div>
      </form>
      <ul class="grid gap-2">
        <For each={fields()}>
          {(field, index) => (
            <FieldRow
              field={field}
              first={index() === 0}
              last={index() === fields().length - 1}
              onEdit={() => beginEdit(field)}
              onDelete={() => void onDelete(field)}
              onUp={() => void onMove(field.id, -1)}
              onDown={() => void onMove(field.id, 1)}
            />
          )}
        </For>
      </ul>
    </section>
  )
}

function FieldRow(props: {
  field: Field
  first: boolean
  last: boolean
  onEdit: () => void
  onDelete: () => void
  onUp: () => void
  onDown: () => void
}) {
  return (
    <li class="flex flex-wrap items-center gap-2 rounded-box bg-base-100 px-4 py-3 shadow-sm">
      <span class="flex-1">
        {props.field.label} <span class="opacity-60">({props.field.type})</span>
      </span>
      <button class="btn btn-sm" type="button" disabled={props.first} onClick={props.onUp}>
        Up
      </button>
      <button class="btn btn-sm" type="button" disabled={props.last} onClick={props.onDown}>
        Down
      </button>
      <button class="btn btn-sm" type="button" onClick={props.onEdit}>
        Edit
      </button>
      <button class="btn btn-sm btn-error btn-outline" type="button" disabled={props.field.builtin} onClick={props.onDelete}>
        Delete
      </button>
    </li>
  )
}

const fieldTypes: FieldType[] = ["text", "textarea", "email", "phone", "date", "select"]

async function saveDraft(id: string | null, draft: FieldDraft) {
  if (id) await updateField(id, draft)
  else await createField(draft)
}

function draftFrom(draft: FieldDraft, optionsText: string): FieldDraft {
  if (draft.type !== "select") return { label: draft.label, type: draft.type, required: draft.required }
  return { ...draft, options: splitOptions(optionsText) }
}

function splitOptions(text: string) {
  return text
    .split(",")
    .map((option) => option.trim())
    .filter((option) => option.length > 0)
}

function messageOf(cause: unknown) {
  return cause instanceof Error ? cause.message : "Something went wrong"
}
