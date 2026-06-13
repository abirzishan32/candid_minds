import { test, expect } from "@playwright/test";

test.describe("Auth pages", () => {
  test("sign-in page renders a form", async ({ page }) => {
    await page.goto("/sign-in");

    await expect(page.locator("form")).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("sign-up page renders a form", async ({ page }) => {
    await page.goto("/sign-up");

    await expect(page.locator("form")).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("forgot-password page loads", async ({ page }) => {
    const response = await page.goto("/forgot-password");
    expect(response?.status()).toBeLessThan(500);
  });
});
