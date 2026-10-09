import { describe, expect, it } from "vitest"
import { slugify, uniqueSlug } from "../src/slug"

describe("slugs", () => {
  it("builds a kebab slug and avoids collisions", () => {
    expect(slugify("  Job Title! ")).toBe("job-title")
    expect(slugify("***")).toBe("field")
    expect(uniqueSlug("Job Title", new Set(["job-title", "job-title-2"]))).toBe("job-title-3")
  })
})
