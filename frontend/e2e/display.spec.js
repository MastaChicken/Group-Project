import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

/**
 * Test the display screen.
 */
test("Checks if the page is display", async ({ page }) => {
  await page.goto("/display");
  expect(await page.title()).toBe("Display");
});

/**
 * Test to see if hiding pdf works
 */
test("Check if pdf renderer is visible", async ({ page }) => {
  await page.goto("/display");
  expect(await page.isVisible("#pdf-renderer")).toBeTruthy();
  // FIXME: selecting first element is a hack
  await page.locator(".show-hide-pdf").first().click();
  expect(await page.isHidden("#pdf-renderer")).toBeTruthy();
});
