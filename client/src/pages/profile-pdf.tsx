import { planProfile, type Employee, type Field, type ProfileLayout } from "@staff/shared"
import { A, useParams } from "@solidjs/router"
import { createMemo, createSignal, onMount, Show } from "solid-js"
import { downloadPdf, getEmployee, getProfileLayout, listFields, saveProfileLayout } from "../api"
import { displayName, messageOf } from "../employee-name"
import { relocateId, toggleId } from "../order"
import { Choice, PaperControls, Toggle } from "../pdf/controls"
import { HiddenFields } from "../pdf/hidden-fields"
import { PageCanvas } from "../pdf/page-canvas"

export function ProfilePdfPage() {
  const params = useParams<{ id: string }>()
  const [employee, setEmployee] = createSignal<Employee | null>(null)
  const [fields, setFields] = createSignal<Field[]>([])
  const [saved, setSaved] = createSignal<ProfileLayout | null>(null)
  const [draft, setDraft] = createSignal<ProfileLayout | null>(null)
  const [notice, setNotice] = createSignal("")
  const [error, setError] = createSignal("")

  onMount(() => {
    void load()
  })

  async function load() {
    try {
      const [nextEmployee, nextFields, layout] = await Promise.all([
        getEmployee(params.id),
        listFields(),
        getProfileLayout(),
      ])
      setEmployee(nextEmployee)
      setFields(nextFields)
      setSaved(layout)
      setDraft(layout)
    } catch (cause) {
      setError(messageOf(cause))
    }
  }

  const plan = createMemo(() => {
    const current = draft()
    const person = employee()
    return current && person ? planProfile(person, fields(), current) : null
  })

  function update(patch: Partial<ProfileLayout>) {
    const current = draft()
    if (current) setDraft({ ...current, ...patch })
    setNotice("")
  }

  async function onDownload() {
    const current = draft()
    const person = employee()
    if (!current || !person) return
    setError("")
    try {
      await downloadPdf(`/api/pdf/profile/${person.id}`, `${displayName(person)}.pdf`, { layout: current })
    } catch (cause) {
      setError(messageOf(cause))
    }
  }

  async function onSave() {
    const current = draft()
    if (!current) return
    setError("")
    try {
      const next = await saveProfileLayout(current)
      setSaved(next)
      setDraft(next)
      setNotice("Saved as the default profile layout")
    } catch (cause) {
      setError(messageOf(cause))
    }
  }

  return (
    <section class="grid gap-4">
      <Show when={employee()}>
        {(person) => (
          <A href={`/employees/${person().id}`} class="link link-hover w-fit text-sm">
            ← {displayName(person())}
          </A>
        )}
      </Show>
      <header class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-2xl font-semibold">Profile PDF</h1>
        <div class="flex flex-wrap gap-2">
          <button class="btn" type="button" disabled={draft() === saved()} onClick={() => setDraft(saved())}>
            Reset
          </button>
          <button class="btn" type="button" onClick={() => void onSave()}>
            Save as default layout
          </button>
          <button class="btn btn-primary" type="button" onClick={() => void onDownload()}>
            Download PDF
          </button>
        </div>
      </header>
      <Show when={error()}>
        <p class="alert alert-error">{error()}</p>
      </Show>
      <Show when={notice()}>
        <p class="alert alert-success">{notice()}</p>
      </Show>
      <Show when={draft()} keyed>
        {(current) => (
          <div class="flex flex-wrap items-end gap-3 rounded-box bg-base-100 p-3 shadow-sm" aria-label="Layout settings">
            <PaperControls value={current} bodyMax={16} onChange={(paper) => update(paper)} />
            <Choice
              label="Columns"
              value={String(current.columns)}
              options={[["1", "One"], ["2", "Two"]]}
              onChange={(value) => update({ columns: value === "2" ? 2 : 1 })}
            />
            <Choice
              label="Labels"
              value={current.labelStyle}
              options={[["inline", "Beside value"], ["stacked", "Above value"]]}
              onChange={(value) => update({ labelStyle: value === "stacked" ? "stacked" : "inline" })}
            />
            <Toggle label="Show empty fields" checked={current.showEmptyFields} onChange={(showEmptyFields) => update({ showEmptyFields })} />
          </div>
        )}
      </Show>
      <Show when={draft()} keyed>
        {(current) => (
          <HiddenFields
            fields={fields()}
            shown={current.fieldIds}
            onAdd={(id) => update({ fieldIds: toggleId(current.fieldIds, id, true) })}
          />
        )}
      </Show>
      <p class="text-sm opacity-70">Click the title to rename it. Drag a field to move it. Hover a field and press × to hide it.</p>
      <Show when={plan()}>
        {(current) => (
          <PageCanvas
            plan={current()}
            actions={{
              onTitle: (title) => update({ title }),
              onMove: (source, target) => update({ fieldIds: relocateId(draft()?.fieldIds ?? [], source, target) }),
              onHide: (id) => update({ fieldIds: toggleId(draft()?.fieldIds ?? [], id, false) }),
            }}
          />
        )}
      </Show>
    </section>
  )
}
