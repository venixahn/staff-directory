import { expect, test } from "@playwright/test"

test("shows the staff directory shell", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("link", { name: "Staff directory" })).toBeVisible()
})
