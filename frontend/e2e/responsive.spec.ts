import { test, expect } from "@playwright/test";

test.describe("Responsive layout", () => {
  test("homepage hero is visible on mobile", async ({ page }) => {
    await page.goto("/");

    const heroCta = page.getByRole("link", { name: /get started/i }).first();
    await expect(heroCta).toBeVisible();
  });
});
