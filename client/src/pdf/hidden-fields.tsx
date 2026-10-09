import type { Field } from "@staff/shared"
import { For, Show } from "solid-js"

export function HiddenFields(props: { fields: Field[]; shown: string[]; onAdd: (fieldId: string) => void }) {
  const hidden = () => props.fields.filter((field) => !props.shown.includes(field.id))
  return (
    <Show when={hidden().length > 0}>
      <div class="flex flex-wrap items-center gap-2" aria-label="Fields not in the PDF">
        <span class="text-sm opacity-70">Add to PDF:</span>
        <For each={hidden()}>
          {(field) => (
            <button class="btn btn-xs btn-outline" type="button" onClick={() => props.onAdd(field.id)}>
              + {field.label}
            </button>
          )}
        </For>
      </div>
    </Show>
  )
}
