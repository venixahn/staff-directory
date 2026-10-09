import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { test as base, expect, type Page } from "@playwright/test"

declare global {
  var __coverage__: unknown
}

const outputDir = path.resolve("coverage/e2e/.nyc_output")

export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    const capture = trackPage(page, testInfo.testId)
    await use(page)
    await capture()
  },
})

function trackPage(page: Page, testId: string) {
  let index = 0
  const capture = async () => {
    const coverage = await page.evaluate(() => globalThis.__coverage__ ?? null).catch(() => null)
    if (coverage) writeSnapshot(testId, index, coverage)
    index += 1
  }
  const goto = page.goto.bind(page)
  page.goto = async (url, options) => {
    await capture()
    return goto(url, options)
  }
  const reload = page.reload.bind(page)
  page.reload = async (options) => {
    await capture()
    return reload(options)
  }
  return capture
}

function writeSnapshot(testId: string, index: number, coverage: unknown) {
  mkdirSync(outputDir, { recursive: true })
  const name = testId.replace(/[^a-z0-9]+/gi, "_")
  writeFileSync(path.join(outputDir, `${name}-${index}.json`), JSON.stringify(coverage))
}

export { expect }
