import type { Field, ProfileLayout, ReportLayout } from "@staff/shared"
import { createSignal, For, onMount, Show, type ParentProps } from "solid-js"
import { downloadPdf, getProfileLayout, getReportLayout, listFields, saveProfileLayout, saveReportLayout } from "../api"
import { moveId, toggleId } from "../order"
import { directoryQuery, setDirectoryQuery } from "../state"

export function ExportPage() {
  const [fields, setFields] = createSignal<Field[]>([])
  const [profile, setProfile] = createSignal<ProfileLayout | null>(null)
  const [report, setReport] = createSignal<ReportLayout | null>(null)
  const [error, setError] = createSignal("")
  const [notice, setNotice] = createSignal("")

  onMount(() => {
    void load()
  })

  async function load() {
    try {
      const [nextFields, nextProfile, nextReport] = await Promise.all([
        listFields(),
        getProfileLayout(),
        getReportLayout(),
      ])
      setFields(nextFields)
      setProfile(nextProfile)
      setReport(nextReport)
    } catch (cause) {
      setError(messageOf(cause))
    }
  }

  async function saveProfile() {
    const current = profile()
    if (!current) return
    setProfile(await saveProfileLayout(current))
    setNotice("Profile layout saved")
  }

  async function saveReport() {
    const current = report()
    if (!current) return
    setReport(await saveReportLayout(current))
    setNotice("Report layout saved")
  }

  async function downloadReport() {
    const query = encodeURIComponent(directoryQuery())
    await downloadPdf(`/api/pdf/report?q=${query}`, "employee-directory.pdf")
  }

  return (
    <section class="grid gap-6">
      <h1 class="text-2xl font-semibold">Export</h1>
      <Show when={error()}>
        <p class="alert alert-error">{error()}</p>
      </Show>
      <Show when={notice()}>
        <p class="alert alert-success">{notice()}</p>
      </Show>
      <label class="form-control gap-1">
        <span>Report search</span>
        <input
          class="input input-bordered"
          aria-label="Report search"
          value={directoryQuery()}
          onInput={(event) => setDirectoryQuery(event.currentTarget.value)}
        />
      </label>
      <Show when={profile()} keyed>
        {(current) => (
          <LayoutCard title="Profile layout" saveLabel="Save profile" onSave={() => void saveProfile()}>
            <LayoutTitle label="Profile title" value={current.title} onChange={(title) => setProfile({ ...current, title })} />
            <Orientation label="Profile orientation" value={current.orientation} onChange={(orientation) => setProfile({ ...current, orientation })} />
            <label class="label cursor-pointer justify-start gap-2">
              <input
                class="checkbox"
                type="checkbox"
                checked={current.showEmptyFields}
                onChange={(event) => setProfile({ ...current, showEmptyFields: event.currentTarget.checked })}
              />
              Show empty fields
            </label>
            <FieldPicker
              fields={fields()}
              selected={current.fieldIds}
              onChange={(fieldIds) => setProfile({ ...current, fieldIds })}
            />
          </LayoutCard>
        )}
      </Show>
      <Show when={report()} keyed>
        {(current) => (
          <LayoutCard title="Report layout" saveLabel="Save report" onSave={() => void saveReport()}>
            <LayoutTitle label="Report title" value={current.title} onChange={(title) => setReport({ ...current, title })} />
            <Orientation label="Report orientation" value={current.orientation} onChange={(orientation) => setReport({ ...current, orientation })} />
            <SortControls layout={current} fields={fields()} onChange={setReport} />
            <FieldPicker
              fields={fields()}
              selected={current.columnIds}
              onChange={(columnIds) => setReport({ ...current, columnIds })}
            />
            <button class="btn" type="button" onClick={() => void downloadReport()}>
              Download report
            </button>
          </LayoutCard>
        )}
      </Show>
    </section>
  )
}

function LayoutCard(props: ParentProps<{ title: string; saveLabel: string; onSave: () => void }>) {
  return (
    <section class="card bg-base-100 shadow-sm">
      <div class="card-body grid gap-3">
        <h2 class="text-lg font-medium">{props.title}</h2>
        {props.children}
        <button class="btn btn-primary w-fit" type="button" onClick={props.onSave}>
          {props.saveLabel}
        </button>
      </div>
    </section>
  )
}

function LayoutTitle(props: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <input
      class="input input-bordered"
      aria-label={props.label}
      value={props.value}
      onInput={(event) => props.onChange(event.currentTarget.value)}
    />
  )
}

function Orientation(props: {
  label: string
  value: "portrait" | "landscape"
  onChange: (value: "portrait" | "landscape") => void
}) {
  return (
    <select
      class="select select-bordered"
      aria-label={props.label}
      value={props.value}
      onChange={(event) => props.onChange(event.currentTarget.value as "portrait" | "landscape")}
    >
      <option value="portrait">Portrait</option>
      <option value="landscape">Landscape</option>
    </select>
  )
}

function SortControls(props: { layout: ReportLayout; fields: Field[]; onChange: (layout: ReportLayout) => void }) {
  return (
    <div class="grid gap-3 md:grid-cols-3">
      <select
        class="select select-bordered"
        aria-label="Sort field"
        value={props.layout.sortFieldId}
        onChange={(event) => props.onChange({ ...props.layout, sortFieldId: event.currentTarget.value })}
      >
        <For each={props.fields}>{(field) => <option value={field.id}>{field.label}</option>}</For>
      </select>
      <select
        class="select select-bordered"
        aria-label="Sort direction"
        value={props.layout.sortDirection}
        onChange={(event) =>
          props.onChange({ ...props.layout, sortDirection: event.currentTarget.value as "asc" | "desc" })
        }
      >
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
      <select
        class="select select-bordered"
        aria-label="Group by"
        value={props.layout.groupByFieldId ?? ""}
        onChange={(event) => props.onChange({ ...props.layout, groupByFieldId: event.currentTarget.value || null })}
      >
        <option value="">No grouping</option>
        <For each={props.fields}>{(field) => <option value={field.id}>{field.label}</option>}</For>
      </select>
    </div>
  )
}

function FieldPicker(props: { fields: Field[]; selected: string[]; onChange: (ids: string[]) => void }) {
  return (
    <ul class="grid gap-2">
      <For each={visibleFields(props.fields, props.selected)}>
        {(field) => (
          <li class="flex items-center gap-2">
            <input
              class="checkbox"
              type="checkbox"
              aria-label={field.label}
              checked={props.selected.includes(field.id)}
              onChange={(event) => props.onChange(toggleId(props.selected, field.id, event.currentTarget.checked))}
            />
            <span class="flex-1">{field.label}</span>
            <button class="btn btn-xs" type="button" onClick={() => props.onChange(moveId(props.selected, field.id, -1))}>
              Up
            </button>
            <button class="btn btn-xs" type="button" onClick={() => props.onChange(moveId(props.selected, field.id, 1))}>
              Down
            </button>
          </li>
        )}
      </For>
    </ul>
  )
}

function visibleFields(fields: Field[], selected: string[]) {
  const chosen = selected.flatMap((id) => {
    const field = fields.find((item) => item.id === id)
    return field ? [field] : []
  })
  const rest = fields.filter((field) => !selected.includes(field.id))
  return [...chosen, ...rest]
}

function messageOf(cause: unknown) {
  return cause instanceof Error ? cause.message : "Something went wrong"
}
