import { expect, test } from "./fixtures"

test("shows the staff directory shell", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("link", { name: "Staff directory" })).toBeVisible()
})
