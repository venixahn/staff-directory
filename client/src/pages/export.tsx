import { planReport, type Employee, type Field, type ReportLayout } from "@staff/shared"
import { Subject } from "rxjs"
import { createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js"
import { downloadPdf, getReportLayout, listEmployees, listFields, saveReportLayout } from "../api"
import { messageOf } from "../employee-name"
import { relocateId, toggleId } from "../order"
import { Choice, PaperControls } from "../pdf/controls"
import { HiddenFields } from "../pdf/hidden-fields"
import { PageCanvas } from "../pdf/page-canvas"
import { bindSearch } from "../search"
import { directoryQuery, setDirectoryQuery } from "../state"

export function ExportPage() {
  const [fields, setFields] = createSignal<Field[]>([])
  const [employees, setEmployees] = createSignal<Employee[]>([])
  const [saved, setSaved] = createSignal<ReportLayout | null>(null)
  const [draft, setDraft] = createSignal<ReportLayout | null>(null)
  const [notice, setNotice] = createSignal("")
  const [error, setError] = createSignal("")
  const query$ = new Subject<string>()

  onMount(() => {
    void load()
    const stop = bindSearch(
      query$,
      (query) =>
        listEmployees(query).catch((cause: unknown) => {
          setError(messageOf(cause))
          return employees()
        }),
      setEmployees,
    )
    query$.next(directoryQuery())
    onCleanup(() => {
      stop()
      query$.complete()
    })
  })

  async function load() {
    try {
      const [nextFields, layout] = await Promise.all([listFields(), getReportLayout()])
      setFields(nextFields)
      setSaved(layout)
      setDraft(layout)
    } catch (cause) {
      setError(messageOf(cause))
    }
  }

  const plan = createMemo(() => {
    const current = draft()
    return current ? planReport(employees(), fields(), current) : null
  })

  function update(patch: Partial<ReportLayout>) {
    const current = draft()
    if (current) setDraft({ ...current, ...patch })
    setNotice("")
  }

  function onSearch(value: string) {
    setDirectoryQuery(value)
    query$.next(value)
  }

  async function onDownload() {
    const current = draft()
    if (!current) return
    try {
      const query = encodeURIComponent(directoryQuery())
      await downloadPdf(`/api/pdf/report?q=${query}`, "employee-directory.pdf", { layout: current })
    } catch (cause) {
      setError(messageOf(cause))
    }
  }

  async function onSave() {
    const current = draft()
    if (!current) return
    try {
      const next = await saveReportLayout(current)
      setSaved(next)
      setDraft(next)
      setNotice("Saved as the default report layout")
    } catch (cause) {
      setError(messageOf(cause))
    }
  }

  return (
    <section class="grid gap-4">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-2xl font-semibold">Report PDF</h1>
        <div class="flex flex-wrap gap-2">
          <button class="btn" type="button" disabled={draft() === saved()} onClick={() => setDraft(saved())}>
            Reset
          </button>
          <button class="btn" type="button" onClick={() => void onSave()}>
            Save as default layout
          </button>
          <button class="btn btn-primary" type="button" onClick={() => void onDownload()}>
            Download report
          </button>
        </div>
      </header>
      <Show when={error()}>
        <p class="alert alert-error">{error()}</p>
      </Show>
      <Show when={notice()}>
        <p class="alert alert-success">{notice()}</p>
      </Show>
      <input
        class="input input-bordered"
        aria-label="Report search"
        placeholder="Who goes in the report? Search name, email, department, or job title"
        value={directoryQuery()}
        onInput={(event) => onSearch(event.currentTarget.value)}
      />
      <Show when={draft()} keyed>
        {(current) => (
          <div class="flex flex-wrap items-end gap-3 rounded-box bg-base-100 p-3 shadow-sm" aria-label="Layout settings">
            <PaperControls value={current} bodyMax={14} onChange={(paper) => update(paper)} />
            <FieldChoice label="Sort by" fields={fields()} value={current.sortFieldId} onChange={(sortFieldId) => update({ sortFieldId })} />
            <Choice
              label="Sort direction"
              value={current.sortDirection}
              options={[["asc", "A to Z"], ["desc", "Z to A"]]}
              onChange={(value) => update({ sortDirection: value === "desc" ? "desc" : "asc" })}
            />
            <FieldChoice
              label="Group by"
              fields={fields()}
              value={current.groupByFieldId ?? ""}
              empty="No grouping"
              onChange={(value) => update({ groupByFieldId: value || null })}
            />
            <Choice
              label="Row spacing"
              value={current.density}
              options={[["comfortable", "Comfortable"], ["compact", "Compact"]]}
              onChange={(value) => update({ density: value === "compact" ? "compact" : "comfortable" })}
            />
          </div>
        )}
      </Show>
      <Show when={draft()} keyed>
        {(current) => (
          <HiddenFields
            fields={fields()}
            shown={current.columnIds}
            onAdd={(id) => update({ columnIds: toggleId(current.columnIds, id, true) })}
          />
        )}
      </Show>
      <p class="text-sm opacity-70">
        Click the title to rename it. Drag a column heading to move it. Hover a heading and press × to remove the column.
      </p>
      <Show when={plan()}>
        {(current) => (
          <PageCanvas
            plan={current()}
            actions={{
              onTitle: (title) => update({ title }),
              onMove: (source, target) => update({ columnIds: relocateId(draft()?.columnIds ?? [], source, target) }),
              onHide: (id) => update({ columnIds: toggleId(draft()?.columnIds ?? [], id, false) }),
            }}
          />
        )}
      </Show>
    </section>
  )
}

function FieldChoice(props: {
  label: string
  fields: Field[]
  value: string
  empty?: string
  onChange: (value: string) => void
}) {
  return (
    <label class="flex flex-col gap-1">
      <span class="label-text text-xs">{props.label}</span>
      <select
        class="select select-bordered select-sm"
        aria-label={props.label}
        value={props.value}
        onChange={(event) => props.onChange(event.currentTarget.value)}
      >
        <Show when={props.empty}>
          <option value="">{props.empty}</option>
        </Show>
        <For each={props.fields}>{(field) => <option value={field.id}>{field.label}</option>}</For>
      </select>
    </label>
  )
}
