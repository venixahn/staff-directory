import { expect, test } from "./fixtures"

test.describe.configure({ mode: "serial" })

test.beforeEach(async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept())
})

test("adds, edits, and deletes an employee", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("link", { name: "Add employee" }).click()
  await page.getByRole("textbox", { name: /First name/ }).fill("Test")
  await page.getByRole("textbox", { name: /Last name/ }).fill("Person")
  await page.getByRole("textbox", { name: /Email/ }).fill("test.person@example.com")
  await page.getByRole("button", { name: "Save" }).click()
  const row = page.getByRole("row", { name: /Test Person/ })
  await expect(row).toBeVisible()

  await row.getByRole("link", { name: "Edit" }).click()
  await page.getByRole("textbox", { name: "Job title" }).fill("Analyst")
  await page.getByRole("button", { name: "Save" }).click()
  await expect(page.getByRole("row", { name: /Test Person/ })).toContainText("Analyst")

  await page.getByRole("row", { name: /Test Person/ }).getByRole("button", { name: "Delete" }).click()
  await expect(page.getByRole("cell", { name: "Test Person" })).toHaveCount(0)
})

test("searches the directory by department", async ({ page }) => {
  await page.goto("/")
  await page.getByLabel("Search employees").fill("Research")
  await expect(page.getByRole("cell", { name: "Katherine Johnson" })).toBeVisible()
  await expect(page.getByRole("cell", { name: "Ada Lovelace" })).toHaveCount(0)
})

test("adds a custom field and removes it with stored values", async ({ page }) => {
  await page.goto("/fields")
  await page.getByLabel("Field label").fill("Nickname")
  await page.getByRole("button", { name: "Add field" }).click()
  await expect(page.getByText("Nickname (text)")).toBeVisible()

  await page.goto("/employees/emp-ada")
  await page.getByRole("textbox", { name: "Nickname" }).fill("A.L.")
  await page.getByRole("button", { name: "Save" }).click()

  await page.goto("/fields")
  await page.getByRole("listitem").filter({ hasText: "Nickname" }).getByRole("button", { name: "Delete" }).click()
  await expect(page.getByText("Nickname (text)")).toHaveCount(0)

  await page.goto("/employees/emp-ada")
  await expect(page.getByRole("textbox", { name: "Nickname" })).toHaveCount(0)
})

test("downloads a profile PDF", async ({ page }) => {
  await page.goto("/")
  const download = page.waitForEvent("download")
  await page.getByRole("row", { name: /Ada Lovelace/ }).getByRole("button", { name: "PDF" }).click()
  expect((await download).suggestedFilename()).toContain(".pdf")
})

test("saves the profile layout", async ({ page }) => {
  await page.goto("/export")
  await page.getByLabel("Profile title").fill("People file")
  await page.getByRole("button", { name: "Save profile" }).click()
  await page.reload()
  await expect(page.getByLabel("Profile title")).toHaveValue("People file")
})

test("saves the report layout and downloads the current search", async ({ page }) => {
  await page.goto("/export")
  await page.getByLabel("Report search").fill("Research")
  await page.getByLabel("Report title").fill("Roster")
  await page.getByLabel("Sort direction").selectOption("desc")
  await page.getByLabel("Group by").selectOption({ label: "Department" })
  const reportCard = page.locator("section.card").filter({ has: page.getByRole("heading", { name: "Report layout" }) })
  await reportCard.getByRole("checkbox", { name: "Phone" }).check()
  await page.getByRole("button", { name: "Save report" }).click()
  await page.reload()
  await expect(page.getByLabel("Report title")).toHaveValue("Roster")
  await expect(page.getByLabel("Sort direction")).toHaveValue("desc")
  await expect(page.getByLabel("Group by")).toHaveValue("department")
  await expect(reportCard.getByRole("checkbox", { name: "Phone" })).toBeChecked()

  await page.getByLabel("Report search").fill("Research")
  const download = page.waitForEvent("download")
  await page.getByRole("button", { name: "Download report" }).click()
  expect((await download).suggestedFilename()).toContain(".pdf")
})
