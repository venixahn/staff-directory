import { filledEntries, recordEntries, type EmployeeValues, type Field } from "@staff/shared"
import { For, Show } from "solid-js"

export function RecordsTable(props: { field: Field; values: EmployeeValues }) {
  const entries = () => filledEntries(recordEntries(props.values, props.field.id))
  return (
    <section class="card bg-base-100 shadow-sm" aria-label={props.field.label}>
      <div class="card-body gap-3">
        <h2 class="text-lg font-medium">{props.field.label}</h2>
        <Show when={entries().length > 0} fallback={<p class="opacity-60">None recorded</p>}>
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <For each={props.field.columns ?? []}>{(column) => <th>{column.label}</th>}</For>
                </tr>
              </thead>
              <tbody>
                <For each={entries()}>
                  {(entry) => (
                    <tr>
                      <For each={props.field.columns ?? []}>{(column) => <td>{entry[column.id] || "—"}</td>}</For>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </Show>
      </div>
    </section>
  )
}
