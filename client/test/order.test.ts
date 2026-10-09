import { describe, expect, it } from "vitest"
import { moveId, relocateId, toggleId } from "../src/order"

describe("field order", () => {
  it("moves an id up or down and ignores the ends", () => {
    expect(moveId(["a", "b", "c"], "b", -1)).toEqual(["b", "a", "c"])
    expect(moveId(["a", "b"], "a", -1)).toEqual(["a", "b"])
  })

  it("drops an id onto another position", () => {
    expect(relocateId(["a", "b", "c", "d"], "a", "c")).toEqual(["b", "c", "a", "d"])
    expect(relocateId(["a", "b", "c"], "c", "a")).toEqual(["c", "a", "b"])
    expect(relocateId(["a", "b"], "a", "a")).toEqual(["a", "b"])
  })

  it("toggles membership without duplicating an id", () => {
    expect(toggleId(["a"], "b", true)).toEqual(["a", "b"])
    expect(toggleId(["a", "b"], "b", true)).toEqual(["a", "b"])
    expect(toggleId(["a", "b"], "a", false)).toEqual(["b"])
  })
})
