import type { Field, FieldDraft, FieldType } from "@staff/shared"
import { createSignal, For, onMount, Show } from "solid-js"
import { createField, listFields, removeField, reorderFields, updateField } from "../api"
import { ColumnsEditor } from "../columns-editor"
import { ConfirmDialog } from "../confirm-dialog"
import { dragItem } from "../drag"
import { relocateId } from "../order"

const emptyDraft: FieldDraft = { label: "", type: "text", required: false }

export function FieldsPage() {
  const [fields, setFields] = createSignal<Field[]>([])
  const [draft, setDraft] = createSignal<FieldDraft>(emptyDraft)
  const [optionsText, setOptionsText] = createSignal("")
  const [editingId, setEditingId] = createSignal<string | null>(null)
  const [error, setError] = createSignal("")
  const [pendingDelete, setPendingDelete] = createSignal<Field | null>(null)
  let labelInput: HTMLInputElement | undefined

  onMount(() => {
    void refresh()
  })

  async function refresh() {
    setFields(await listFields())
  }

  function beginEdit(field: Field) {
    setEditingId(field.id)
    setDraft({ label: field.label, type: field.type, required: field.required, options: field.options, columns: field.columns })
    setOptionsText(field.options?.join(", ") ?? "")
    labelInput?.scrollIntoView({ block: "center" })
    labelInput?.focus({ preventScroll: true })
  }

  function resetForm() {
    setEditingId(null)
    setDraft(emptyDraft)
    setOptionsText("")
  }

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault()
    setError("")
    try {
      await saveDraft(editingId(), draftFrom(draft(), optionsText()))
      resetForm()
      await refresh()
    } catch (cause) {
      setError(messageOf(cause))
    }
  }

  async function onDelete(field: Field) {
    setPendingDelete(null)
    setError("")
    try {
      await removeField(field.id)
      await refresh()
    } catch (cause) {
      setError(messageOf(cause))
    }
  }

  async function onReorder(sourceId: string, targetId: string) {
    const current = fields().map((field) => field.id)
    const ids = relocateId(current, sourceId, targetId)
    if (ids === current) return
    setError("")
    try {
      setFields(await reorderFields(ids))
    } catch (cause) {
      setError(messageOf(cause))
    }
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
            ref={labelInput}
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
            onChange={(event) => setDraft(withType(draft(), event.currentTarget.value as FieldType))}
          >
            <For each={fieldTypes}>{(type) => <option value={type}>{typeLabel(type)}</option>}</For>
          </select>
          <Show when={draft().type === "records"}>
            <ColumnsEditor columns={draft().columns ?? []} onChange={(columns) => setDraft({ ...draft(), columns })} />
          </Show>
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
          {(field) => (
            <FieldRow
              field={field}
              onEdit={() => beginEdit(field)}
              onDelete={() => setPendingDelete(field)}
              onReorder={onReorder}
            />
          )}
        </For>
      </ul>
      <Show when={pendingDelete()} keyed>
        {(field) => (
          <ConfirmDialog
            title={`Delete the ${field.label} field?`}
            confirmText={field.label}
            actionLabel="Delete field"
            onConfirm={() => void onDelete(field)}
            onCancel={() => setPendingDelete(null)}
          >
            <p>Every employee loses the value stored in this field, and both PDF layouts drop it. It cannot be undone.</p>
          </ConfirmDialog>
        )}
      </Show>
    </section>
  )
}

function FieldRow(props: {
  field: Field
  onEdit: () => void
  onDelete: () => void
  onReorder: (sourceId: string, targetId: string) => void
}) {
  return (
    <li
      class="flex cursor-grab flex-wrap items-center gap-2 rounded-box bg-base-100 px-4 py-3 shadow-sm active:cursor-grabbing"
      {...dragItem(props.field.id, props.onReorder)}
    >
      <span class="select-none opacity-50" aria-hidden="true">
        ⠿
      </span>
      <span class="flex-1">
        {props.field.label} <span class="opacity-60">({fieldSummary(props.field)})</span>
      </span>
      <button class="btn btn-sm" type="button" onClick={props.onEdit}>
        Edit
      </button>
      <button class="btn btn-sm btn-error btn-outline" type="button" disabled={props.field.builtin} onClick={props.onDelete}>
        Delete
      </button>
    </li>
  )
}

const fieldTypes: FieldType[] = ["text", "textarea", "email", "phone", "date", "select", "records"]

function typeLabel(type: FieldType) {
  return type === "records" ? "records (list of entries)" : type
}

function fieldSummary(field: Field) {
  if (field.type !== "records") return field.type
  return `records: ${(field.columns ?? []).map((column) => column.label).join(", ")}`
}

function withType(draft: FieldDraft, type: FieldType): FieldDraft {
  const needsColumn = type === "records" && !draft.columns?.length
  return { ...draft, type, columns: needsColumn ? [{ label: "", type: "text" }] : draft.columns }
}

async function saveDraft(id: string | null, draft: FieldDraft) {
  if (id) await updateField(id, draft)
  else await createField(draft)
}

function draftFrom(draft: FieldDraft, optionsText: string): FieldDraft {
  const base = { label: draft.label, type: draft.type, required: draft.required }
  if (draft.type === "select") return { ...base, options: splitOptions(optionsText) }
  if (draft.type === "records") return { ...base, columns: (draft.columns ?? []).filter((column) => column.label.trim()) }
  return base
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
