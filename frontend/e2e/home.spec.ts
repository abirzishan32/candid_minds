import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads and shows brand + hero CTA", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/ChakriGO/i);

    const heroCta = page.getByRole("link", { name: /get started/i }).first();
    await expect(heroCta).toBeVisible();
  });

  test("feature sections render key product names", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /AI Mock Interviews/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Resume Builder/i })
    ).toBeVisible();
  });
});
