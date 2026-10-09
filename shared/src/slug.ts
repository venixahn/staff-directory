export function slugify(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug.length > 0 ? slug : "field"
}

export function uniqueSlug(label: string, taken: ReadonlySet<string>): string {
  const base = slugify(label)
  if (!taken.has(base)) return base
  return nextFreeSlug(base, taken, 2)
}

function nextFreeSlug(base: string, taken: ReadonlySet<string>, suffix: number): string {
  const candidate = `${base}-${suffix}`
  if (!taken.has(candidate)) return candidate
  return nextFreeSlug(base, taken, suffix + 1)
}
