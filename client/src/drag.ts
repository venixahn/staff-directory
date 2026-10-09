const highlight = ["ring-2", "ring-primary"]

export function dragItem(id: string, onDropId: (sourceId: string, targetId: string) => void) {
  return {
    draggable: true as const,
    onDragStart(event: DragEvent) {
      event.dataTransfer?.setData("text/plain", id)
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move"
    },
    onDragOver(event: DragEvent & { currentTarget: HTMLElement }) {
      event.preventDefault()
      event.currentTarget.classList.add(...highlight)
    },
    onDragLeave(event: DragEvent & { currentTarget: HTMLElement }) {
      event.currentTarget.classList.remove(...highlight)
    },
    onDrop(event: DragEvent & { currentTarget: HTMLElement }) {
      event.preventDefault()
      event.currentTarget.classList.remove(...highlight)
      const sourceId = event.dataTransfer?.getData("text/plain") ?? ""
      if (sourceId) onDropId(sourceId, id)
    },
  }
}
