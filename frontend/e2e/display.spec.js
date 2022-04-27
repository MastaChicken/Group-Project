import { test, expect } from "@playwright/test";

/**
 * Test the display screen.
 */
test("Checks if the page is display", async ({ page }) => {
  await page.goto("/display");
  expect(await page.title()).toBe("Display");
});

/**
 * Test to see if renderer is visible when checkbox is ticked.
 */
test("Check if pdf renderer is visible", async ({ page }) => {
  await page.goto("/display");
  await page.check("#output-show-document");
  expect(await page.isChecked("#output-show-document")).toBeTruthy();
  expect(await page.isVisible("#pdf-renderer")).toBeTruthy();
});

/**
 * Test to see if renderer is invisible when checkbox is unticked.
 */
test("Check if pdf renderer is invisible", async ({ page }) => {
  await page.goto("/display");
  await page.uncheck("#output-show-document");
  expect(await page.isChecked("#output-show-document")).toBeFalsy();
  expect(await page.isHidden("#pdf-renderer")).toBeTruthy();
});
