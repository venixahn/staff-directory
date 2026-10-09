import { Subject } from "rxjs"
import { afterEach, describe, expect, it, vi } from "vitest"
import { bindSearch } from "../src/search"

describe("search bridge", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("keeps the latest query after the debounce", async () => {
    vi.useFakeTimers()
    const query$ = new Subject<string>()
    const loads: string[] = []
    const received: string[] = []
    const stop = bindSearch(
      query$,
      async (query) => {
        loads.push(query)
        return query.toUpperCase()
      },
      (value) => received.push(value),
    )
    query$.next("a")
    query$.next("al")
    await vi.advanceTimersByTimeAsync(200)
    expect(loads).toEqual(["al"])
    expect(received).toEqual(["AL"])
    stop()
  })
})
