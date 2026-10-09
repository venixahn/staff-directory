import type { Margin, PageSize } from "@staff/shared"
import { For } from "solid-js"

export interface PaperSettings {
  pageSize: PageSize
  orientation: "portrait" | "landscape"
  margin: Margin
  titleSize: number
  bodySize: number
}

export function PaperControls(props: {
  value: PaperSettings
  bodyMax: number
  onChange: (value: PaperSettings) => void
}) {
  const set = (patch: Partial<PaperSettings>) => props.onChange({ ...props.value, ...patch })
  return (
    <>
      <Choice
        label="Page size"
        value={props.value.pageSize}
        options={[["A4", "A4"], ["LETTER", "Letter"]]}
        onChange={(value) => set({ pageSize: value as PageSize })}
      />
      <Choice
        label="Orientation"
        value={props.value.orientation}
        options={[["portrait", "Portrait"], ["landscape", "Landscape"]]}
        onChange={(value) => set({ orientation: value as PaperSettings["orientation"] })}
      />
      <Choice
        label="Margins"
        value={props.value.margin}
        options={[["narrow", "Narrow"], ["normal", "Normal"], ["wide", "Wide"]]}
        onChange={(value) => set({ margin: value as Margin })}
      />
      <SizeField label="Title size" value={props.value.titleSize} min={12} max={28} onChange={(titleSize) => set({ titleSize })} />
      <SizeField label="Text size" value={props.value.bodySize} min={8} max={props.bodyMax} onChange={(bodySize) => set({ bodySize })} />
    </>
  )
}

export function Choice(props: { label: string; value: string; options: string[][]; onChange: (value: string) => void }) {
  return (
    <label class="flex flex-col gap-1">
      <span class="label-text text-xs">{props.label}</span>
      <select
        class="select select-bordered select-sm"
        aria-label={props.label}
        value={props.value}
        onChange={(event) => props.onChange(event.currentTarget.value)}
      >
        <For each={props.options}>{(option) => <option value={option[0]}>{option[1]}</option>}</For>
      </select>
    </label>
  )
}

export function SizeField(props: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <label class="flex flex-col gap-1">
      <span class="label-text text-xs">{props.label}</span>
      <input
        class="input input-bordered input-sm w-24"
        type="number"
        min={props.min}
        max={props.max}
        aria-label={props.label}
        value={props.value}
        onChange={(event) => props.onChange(bounded(event.currentTarget.value, props.min, props.max, props.value))}
      />
    </label>
  )
}

export function Toggle(props: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label class="label cursor-pointer gap-2 self-end">
      <input
        class="toggle toggle-sm"
        type="checkbox"
        aria-label={props.label}
        checked={props.checked}
        onChange={(event) => props.onChange(event.currentTarget.checked)}
      />
      <span class="label-text text-xs">{props.label}</span>
    </label>
  )
}

function bounded(raw: string, min: number, max: number, fallback: number) {
  const value = Number(raw)
  if (!Number.isInteger(value)) return fallback
  return Math.min(Math.max(value, min), max)
}
