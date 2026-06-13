import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("homepage CTA navigates to sign-up", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /get started/i }).first().click();
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test("login link in navbar navigates to sign-in", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /^login$/i }).click();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("feature section links route to product pages", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /try mock interview/i })).toHaveAttribute(
      "href",
      /\/interview-main/
    );
    await expect(page.getByRole("link", { name: /take verified assessment/i })).toHaveAttribute(
      "href",
      /\/skill-assessment/
    );
    await expect(page.getByRole("link", { name: /build your resume/i })).toHaveAttribute(
      "href",
      /\/resume-builder/
    );
    await expect(
      page.getByRole("link", { name: /explore interview experiences/i })
    ).toHaveAttribute("href", /\/career/);
  });
});
