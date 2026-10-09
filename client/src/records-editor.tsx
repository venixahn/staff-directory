import type { Field, RecordColumn, RecordEntry } from "@staff/shared"
import { For, Index, Show } from "solid-js"

export function RecordsEditor(props: { field: Field; entries: RecordEntry[]; onChange: (entries: RecordEntry[]) => void }) {
  const columns = () => props.field.columns ?? []
  const setCell = (index: number, columnId: string, value: string) =>
    props.onChange(props.entries.map((entry, at) => (at === index ? { ...entry, [columnId]: value } : entry)))
  const remove = (index: number) => props.onChange(props.entries.filter((_, at) => at !== index))

  return (
    <fieldset class="grid gap-2 rounded-box border border-base-300 p-3">
      <legend class="label-text px-1">
        {props.field.label}
        {props.field.required ? " *" : ""}
      </legend>
      <Show when={props.entries.length === 0}>
        <p class="text-sm opacity-60">No entries yet.</p>
      </Show>
      <Index each={props.entries}>
        {(entry, index) => (
          <div class="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] items-end gap-2 rounded-box bg-base-200 p-2">
            <For each={columns()}>
              {(column) => (
                <CellInput
                  label={`${props.field.label} ${index + 1} ${column.label}`}
                  column={column}
                  value={entry()[column.id] ?? ""}
                  onInput={(value) => setCell(index, column.id, value)}
                />
              )}
            </For>
            <button
              class="btn btn-sm btn-ghost"
              type="button"
              aria-label={`Remove ${props.field.label} ${index + 1}`}
              onClick={() => remove(index)}
            >
              Remove
            </button>
          </div>
        )}
      </Index>
      <button
        class="btn btn-sm btn-outline w-fit"
        type="button"
        onClick={() => props.onChange([...props.entries, {}])}
      >
        Add {props.field.label} entry
      </button>
    </fieldset>
  )
}

function CellInput(props: { label: string; column: RecordColumn; value: string; onInput: (value: string) => void }) {
  return (
    <label class="flex flex-col gap-1">
      <span class="text-xs opacity-70">{props.column.label}</span>
      <input
        class="input input-bordered input-sm"
        type={props.column.type === "date" ? "date" : "text"}
        aria-label={props.label}
        value={props.value}
        onInput={(event) => props.onInput(event.currentTarget.value)}
      />
    </label>
  )
}
