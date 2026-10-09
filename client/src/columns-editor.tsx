import type { RecordColumnDraft, RecordColumnType } from "@staff/shared"
import { Index } from "solid-js"

export function ColumnsEditor(props: { columns: RecordColumnDraft[]; onChange: (columns: RecordColumnDraft[]) => void }) {
  const patch = (index: number, change: Partial<RecordColumnDraft>) =>
    props.onChange(props.columns.map((column, at) => (at === index ? { ...column, ...change } : column)))

  return (
    <fieldset class="grid gap-2 rounded-box border border-base-300 p-3 md:col-span-2">
      <legend class="label-text px-1">Columns in each entry</legend>
      <Index each={props.columns}>
        {(column, index) => (
          <div class="flex flex-wrap gap-2">
            <input
              class="input input-bordered input-sm flex-1"
              aria-label={`Column ${index + 1} label`}
              placeholder="Column label, e.g. School"
              value={column().label}
              onInput={(event) => patch(index, { label: event.currentTarget.value })}
            />
            <select
              class="select select-bordered select-sm w-28"
              aria-label={`Column ${index + 1} type`}
              value={column().type}
              onChange={(event) => patch(index, { type: event.currentTarget.value as RecordColumnType })}
            >
              <option value="text">Text</option>
              <option value="date">Date</option>
            </select>
            <button
              class="btn btn-sm btn-ghost"
              type="button"
              aria-label={`Remove column ${index + 1}`}
              onClick={() => props.onChange(props.columns.filter((_, at) => at !== index))}
            >
              Remove
            </button>
          </div>
        )}
      </Index>
      <button
        class="btn btn-sm btn-outline w-fit"
        type="button"
        onClick={() => props.onChange([...props.columns, { label: "", type: "text" }])}
      >
        Add column
      </button>
    </fieldset>
  )
}
