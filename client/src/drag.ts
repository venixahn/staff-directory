export function dragItem(id: string, onDropId: (sourceId: string, targetId: string) => void) {
  return {
    draggable: true as const,
    onDragStart(event: DragEvent) {
      event.dataTransfer?.setData("text/plain", id)
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move"
    },
    onDragOver(event: DragEvent) {
      event.preventDefault()
    },
    onDrop(event: DragEvent) {
      event.preventDefault()
      const sourceId = event.dataTransfer?.getData("text/plain") ?? ""
      if (sourceId) onDropId(sourceId, id)
    },
  }
}
