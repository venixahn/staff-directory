import { pageDimensions, pdfSpacing, type PdfPlan, type PlannedField, type PlannedSection, type PlannedTable } from "@staff/shared"
import { createSignal, For, onCleanup, onMount, Show } from "solid-js"
import { dragItem } from "../drag"

export interface CanvasActions {
  onTitle: (title: string) => void
  onMove: (sourceId: string, targetId: string) => void
  onHide: (fieldId: string) => void
}

export function PageCanvas(props: { plan: PdfPlan; actions: CanvasActions }) {
  const [width, setWidth] = createSignal(600)
  let host: HTMLDivElement | undefined

  onMount(() => {
    if (!host) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry?.contentRect.width ?? 600))
    observer.observe(host)
    onCleanup(() => observer.disconnect())
  })

  const page = () => pageDimensions(props.plan)
  const scale = () => Math.min(width() / page().width, 1.6)
  const px = (points: number) => `${points * scale()}px`

  return (
    <div ref={host} class="w-full">
      <div
        class="relative mx-auto bg-white text-black shadow-lg ring-1 ring-base-300"
        data-testid="pdf-page"
        style={{
          width: px(page().width),
          "min-height": px(page().height),
          padding: px(props.plan.margins),
          "font-family": "Helvetica, Arial, sans-serif",
          "font-size": px(props.plan.bodySize),
          "line-height": String(pdfSpacing.lineHeight),
          "background-image": pageBreaks(page().height * scale()),
        }}
      >
        <input
          class="block w-full rounded bg-transparent p-0 font-bold outline-none hover:bg-yellow-50 focus:bg-yellow-50"
          aria-label="PDF title"
          style={{
            "font-size": px(props.plan.titleSize),
            height: px(props.plan.titleSize * pdfSpacing.lineHeight),
            "margin-bottom": px(pdfSpacing.titleGap),
          }}
          value={props.plan.title}
          onInput={(event) => props.actions.onTitle(event.currentTarget.value)}
        />
        <For each={props.plan.blocks}>
          {(block) => {
            if (block.kind === "field") return <FieldBlock field={block} actions={props.actions} scale={scale()} />
            if (block.kind === "columns") return <ColumnsBlock columns={block.columns} actions={props.actions} scale={scale()} />
            if (block.kind === "section") return <SectionBlock section={block} actions={props.actions} scale={scale()} />
            return <TableBlock table={block} actions={props.actions} scale={scale()} />
          }}
        </For>
      </div>
    </div>
  )
}

function ColumnsBlock(props: { columns: PlannedField[][]; actions: CanvasActions; scale: number }) {
  return (
    <div class="grid grid-cols-2" style={{ "column-gap": `${pdfSpacing.columnGap * props.scale}px` }}>
      <For each={props.columns}>
        {(column) => (
          <div>
            <For each={column}>{(field) => <FieldBlock field={field} actions={props.actions} scale={props.scale} />}</For>
          </div>
        )}
      </For>
    </div>
  )
}

function FieldBlock(props: { field: PlannedField; actions: CanvasActions; scale: number }) {
  const stacked = () => props.field.labelStyle === "stacked"
  return (
    <div
      class="group relative cursor-grab rounded outline-none hover:bg-sky-50 focus:bg-sky-50"
      role="group"
      tabIndex={0}
      aria-roledescription="draggable field"
      aria-label={props.field.label}
      data-field={props.field.fieldId}
      style={{ padding: `${(stacked() ? pdfSpacing.stackedFieldGap : pdfSpacing.inlineFieldGap) * props.scale}px 0` }}
      {...dragItem(props.field.fieldId, props.actions.onMove)}
    >
      <Show
        when={stacked()}
        fallback={
          <span>
            <b>{props.field.label}: </b>
            {props.field.value}
          </span>
        }
      >
        <b class="block">{props.field.label}</b>
        <span class="block">{props.field.value}</span>
      </Show>
      <HideButton label={props.field.label} onHide={() => props.actions.onHide(props.field.fieldId)} />
    </div>
  )
}

function TableBlock(props: { table: PlannedTable; actions: CanvasActions; scale: number }) {
  const cell = () => ({ padding: `${props.table.padding * props.scale}px ${pdfSpacing.cellPaddingX * props.scale}px`, border: `${props.scale}px solid #000` })
  return (
    <Show when={props.table.columns.length > 0} fallback={<p class="italic">No columns selected</p>}>
      <table class="w-full table-fixed border-collapse">
        <thead>
          <tr>
            <For each={props.table.columns}>
              {(column) => (
                <th
                  class="group relative cursor-grab text-left outline-none hover:bg-sky-50 focus:bg-sky-50"
                  tabIndex={0}
                  aria-roledescription="draggable column"
                  data-field={column.fieldId}
                  style={cell()}
                  {...dragItem(column.fieldId, props.actions.onMove)}
                >
                  {column.label}
                  <HideButton label={column.label} onHide={() => props.actions.onHide(column.fieldId)} />
                </th>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          <For each={props.table.rows}>
            {(row) =>
              row.kind === "group" ? (
                <tr>
                  <td class="font-bold" colSpan={props.table.columns.length} style={{ ...cell(), background: "#eeeeee" }}>
                    {row.label}
                  </td>
                </tr>
              ) : (
                <tr>
                  <For each={row.cells}>{(value) => <td style={cell()}>{value}</td>}</For>
                </tr>
              )
            }
          </For>
        </tbody>
      </table>
    </Show>
  )
}

function SectionBlock(props: { section: PlannedSection; actions: CanvasActions; scale: number }) {
  const cell = () => ({
    padding: `${pdfSpacing.sectionCellPadding * props.scale}px ${pdfSpacing.cellPaddingX * props.scale}px`,
    border: `${props.scale}px solid #000`,
  })
  return (
    <div
      class="group relative cursor-grab rounded outline-none hover:bg-sky-50 focus:bg-sky-50"
      role="group"
      tabIndex={0}
      aria-roledescription="draggable section"
      aria-label={props.section.label}
      data-field={props.section.fieldId}
      style={{ "padding-top": `${pdfSpacing.sectionGap * props.scale}px` }}
      {...dragItem(props.section.fieldId, props.actions.onMove)}
    >
      <b class="block" style={{ "margin-bottom": `${pdfSpacing.sectionLabelGap * props.scale}px` }}>
        {props.section.label}
      </b>
      <Show when={props.section.rows.length > 0} fallback={<span>—</span>}>
        <table class="w-full table-fixed border-collapse">
          <thead>
            <tr>
              <For each={props.section.columns}>{(column) => <th class="text-left" style={cell()}>{column.label}</th>}</For>
            </tr>
          </thead>
          <tbody>
            <For each={props.section.rows}>
              {(row) => (
                <tr>
                  <For each={row}>{(value) => <td style={cell()}>{value}</td>}</For>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </Show>
      <HideButton label={props.section.label} onHide={() => props.actions.onHide(props.section.fieldId)} />
    </div>
  )
}

function HideButton(props: { label: string; onHide: () => void }) {
  return (
    <button
      class="btn btn-circle btn-xs absolute -right-2 -top-2 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
      type="button"
      aria-label={`Hide ${props.label}`}
      onClick={(event) => {
        event.stopPropagation()
        props.onHide()
      }}
    >
      ×
    </button>
  )
}

function pageBreaks(pageHeight: number) {
  return `repeating-linear-gradient(to bottom, transparent 0, transparent ${pageHeight - 1}px, #c0c0c0 ${pageHeight - 1}px, #c0c0c0 ${pageHeight}px)`
}
