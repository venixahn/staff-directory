import { expect, test } from "./fixtures"

test.describe.configure({ mode: "serial" })

test("adds, edits, and deletes an employee", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("link", { name: "Add employee" }).click()
  await page.getByRole("textbox", { name: /First name/ }).fill("Test")
  await page.getByRole("textbox", { name: /Last name/ }).fill("Person")
  await page.getByRole("textbox", { name: /Email/ }).fill("test.person@example.com")
  await page.getByRole("button", { name: "Save" }).click()
  await expect(page.getByRole("heading", { name: "Test Person" })).toBeVisible()

  await page.getByRole("link", { name: "Edit" }).click()
  await page.getByRole("textbox", { name: "Job title" }).fill("Analyst")
  await page.getByRole("button", { name: "Save" }).click()
  await expect(page.getByText("Analyst").first()).toBeVisible()

  await page.getByRole("link", { name: "← Directory" }).click()
  await expect(page.getByRole("row", { name: /Test Person/ })).toContainText("Analyst")
  await page.getByRole("row", { name: /Test Person/ }).getByRole("cell", { name: "Analyst" }).click()
  await expect(page.getByRole("heading", { name: "Test Person" })).toBeVisible()

  await page.getByRole("button", { name: "Delete" }).click()
  await page.getByRole("button", { name: "Cancel" }).click()
  await expect(page.getByRole("heading", { name: "Test Person" })).toBeVisible()

  await page.getByRole("button", { name: "Delete" }).click()
  const confirmDelete = page.getByRole("button", { name: "Delete employee" })
  await expect(confirmDelete).toBeDisabled()
  await expect(page.getByLabel("Confirmation text")).toBeFocused()
  await page.getByLabel("Confirmation text").fill("Test Person")
  await confirmDelete.click()
  await expect(page.getByRole("heading", { name: "Directory" })).toBeVisible()
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

  await page.goto("/employees/emp-ada/edit")
  await page.getByRole("textbox", { name: "Nickname" }).fill("A.L.")
  await page.getByRole("button", { name: "Save" }).click()
  await expect(page.getByText("A.L.")).toBeVisible()

  await page.goto("/fields")
  await page.getByRole("listitem").filter({ hasText: "Nickname" }).getByRole("button", { name: "Delete" }).click()
  await page.getByLabel("Confirmation text").fill("Nickname")
  await page.getByRole("button", { name: "Delete field" }).click()
  await expect(page.getByText("Nickname (text)")).toHaveCount(0)

  await page.goto("/employees/emp-ada/edit")
  await expect(page.getByRole("textbox", { name: "Nickname" })).toHaveCount(0)
})

test("reorders fields by dragging", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1600 })
  await page.goto("/fields")
  const office = page.getByRole("listitem").filter({ hasText: "Office" })
  const phone = page.getByRole("listitem").filter({ hasText: "Phone" })
  await office.dragTo(phone)
  await expect(page.getByRole("listitem").nth(3)).toContainText("Office")
  await page.reload()
  await expect(page.getByRole("listitem").nth(3)).toContainText("Office")
  await expect(page.getByRole("button", { name: "Up" })).toHaveCount(0)
})

test("downloads a profile PDF from the designer", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("link", { name: "Ada Lovelace" }).click()
  await page.getByRole("link", { name: "Download PDF" }).click()
  await expect(page.getByRole("heading", { name: "Profile PDF" })).toBeVisible()
  await expect(page.getByTestId("pdf-page")).toContainText("ada@example.com")
  const download = page.waitForEvent("download")
  await page.getByRole("button", { name: "Download PDF" }).click()
  expect((await download).suggestedFilename()).toContain(".pdf")
})

test("designs the profile PDF on the page", async ({ page }) => {
  await page.goto("/employees/emp-ada/pdf")
  const sheet = page.getByTestId("pdf-page")
  const fieldOrder = () => sheet.locator("[data-field]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-field")))

  await sheet.getByRole("group", { name: "Office" }).dragTo(sheet.getByRole("group", { name: "First name" }))
  await expect.poll(fieldOrder).toEqual(["office", "firstName", "lastName", "email", "department", "jobTitle", "hireDate", "status"])

  await sheet.getByRole("group", { name: "Email" }).hover()
  await page.getByRole("button", { name: "Hide Email" }).click()
  await expect(sheet).not.toContainText("ada@example.com")
  await page.getByRole("button", { name: "+ Email" }).click()
  await expect(sheet).toContainText("ada@example.com")

  await page.getByLabel("Columns").selectOption({ label: "Two" })
  await expect(sheet.locator(".grid-cols-2")).toHaveCount(1)
  await page.getByRole("button", { name: "Reset" }).click()
  await expect.poll(fieldOrder).toEqual(["firstName", "lastName", "email", "department", "jobTitle", "hireDate", "status", "office"])
})

test("saves the profile layout as the default", async ({ page }) => {
  await page.goto("/employees/emp-ada/pdf")
  await page.getByLabel("PDF title").fill("People file")
  await page.getByLabel("Labels").selectOption({ label: "Above value" })
  await page.getByRole("button", { name: "Save as default layout" }).click()
  await expect(page.getByText("Saved as the default profile layout")).toBeVisible()
  await page.goto("/employees/emp-grace/pdf")
  await expect(page.getByLabel("PDF title")).toHaveValue("People file")
  await expect(page.getByLabel("Labels")).toHaveValue("stacked")
})

test("saves the report layout and downloads the current search", async ({ page }) => {
  await page.goto("/export")
  await page.getByLabel("Report search").fill("Research")
  await page.getByLabel("PDF title").fill("Roster")
  await page.getByLabel("Sort direction").selectOption("desc")
  await page.getByLabel("Group by").selectOption({ label: "Department" })
  await page.getByRole("button", { name: "+ Phone" }).click()
  await expect(page.getByTestId("pdf-page").getByRole("columnheader", { name: "Phone" })).toBeVisible()
  await page.getByRole("button", { name: "Save as default layout" }).click()
  await expect(page.getByText("Saved as the default report layout")).toBeVisible()
  await page.reload()
  await expect(page.getByLabel("PDF title")).toHaveValue("Roster")
  await expect(page.getByLabel("Sort direction")).toHaveValue("desc")
  await expect(page.getByLabel("Group by")).toHaveValue("department")
  await expect(page.getByRole("button", { name: "+ Phone" })).toHaveCount(0)

  await page.getByLabel("Report search").fill("Research")
  await expect(page.getByTestId("pdf-page")).not.toContainText("Lovelace")
  const download = page.waitForEvent("download")
  await page.getByRole("button", { name: "Download report" }).click()
  expect((await download).suggestedFilename()).toContain(".pdf")
})
