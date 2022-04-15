import { test, expect } from "@playwright/test";
import path from "path";

test.skip("click upload without input", async ({ page }) => {
  await page.goto(`file:${path.join(path.resolve(), "index.html")}`);

  await page.click('input:has-text("Upload")');

  // TODO: add `await expect(...)`
});
