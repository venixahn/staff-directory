export function moveId(ids: string[], id: string, direction: -1 | 1): string[] {
  const index = ids.indexOf(id)
  const target = index + direction
  if (outOfRange(index, target, ids.length)) return ids
  const copy = [...ids]
  const [item] = copy.splice(index, 1)
  if (!item) return ids
  copy.splice(target, 0, item)
  return copy
}

export function toggleId(ids: string[], id: string, on: boolean): string[] {
  if (!on) return ids.filter((item) => item !== id)
  if (ids.includes(id)) return ids
  return [...ids, id]
}

function outOfRange(index: number, target: number, length: number) {
  if (index < 0) return true
  if (target < 0) return true
  return target >= length
}
