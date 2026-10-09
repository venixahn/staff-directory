import { createSignal, type JSX } from "solid-js"

export function ConfirmDialog(props: {
  title: string
  children: JSX.Element
  confirmText: string
  actionLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const [typed, setTyped] = createSignal("")
  const matches = () => typed().trim() === props.confirmText.trim()

  return (
    <div class="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div class="modal-box grid gap-3" onKeyDown={(event) => event.key === "Escape" && props.onCancel()}>
        <h2 id="confirm-title" class="text-lg font-semibold">
          {props.title}
        </h2>
        <div>{props.children}</div>
        <label class="form-control gap-1">
          <span class="label-text">
            Type <strong>{props.confirmText}</strong> to confirm
          </span>
          <input
            class="input input-bordered"
            aria-label="Confirmation text"
            ref={(input) => queueMicrotask(() => input.focus())}
            value={typed()}
            onInput={(event) => setTyped(event.currentTarget.value)}
          />
        </label>
        <div class="modal-action">
          <button class="btn" type="button" onClick={props.onCancel}>
            Cancel
          </button>
          <button class="btn btn-error" type="button" disabled={!matches()} onClick={props.onConfirm}>
            {props.actionLabel}
          </button>
        </div>
      </div>
      <div class="modal-backdrop" onClick={props.onCancel} />
    </div>
  )
}