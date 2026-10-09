import { describe, expect, it } from "vitest"
import { packageName } from "../src/index"

describe("shared package", () => {
  it("exposes its package name", () => {
    expect(packageName).toBe("@staff/shared")
  })
})
