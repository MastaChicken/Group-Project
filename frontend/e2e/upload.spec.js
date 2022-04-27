import { test, expect } from "@playwright/test";

/**
 * Test the default screen.
 */
test("Checks if initial page is upload", async ({ page }) => {
  await page.goto("/");
  expect(await page.title()).toBe("Upload");
});

/**
 * Test for when academic uploads journal article as a PDF
 */
test.skip("If uploads a PDF, should switch to display screen", async ({ page }) => {
  await page.goto("/");
  await page.setInputFiles("input#pdfpicker-file", {
    name: "file.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("this is test"),
  });
  expect(await page.title()).toBe("Display");
});

/**
 * Test for when academic uploads a none PDF file
 */
test("If uploads a NON-PDF, stay on upload screen", async ({ page }) => {
  await page.goto("/");
  await page.setInputFiles("input#pdfpicker-file", {
    name: "file.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("this is test"),
  });
  expect(await page.title()).toBe("Upload");
});

/**
 * Test for when academic uploads an empty file
 */
test("If uploads a empty PDF, stay on upload screen", async ({ page }) => {
  await page.goto("/");
  await page.setInputFiles("input#pdfpicker-file", {
    name: "file.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from(""),
  });
  expect(await page.title()).toBe("Upload");
});

/**
 * Test for file with non-pdf extension and pdf mimetype.
 */
test.skip("If uploads a text file with a pdf mime type, should return client error", async ({
  page,
}) => {
  await page.goto("/");
  await page.setInputFiles("input#pdfpicker-file", {
    name: "file.txt",
    mimeType: "application/pdf",
    buffer: Buffer.from("this is a test"),
  });
  expect(await page.title()).toBe("Display");
});

/**
 * Test for pdf file which somehow has a text mime type.
 */
test("If uploads a pdf file with a text mime type, stay on upload screen", async ({
  page,
}) => {
  await page.goto("/");
  await page.setInputFiles("input#pdfpicker-file", {
    name: "file.pdf",
    mimeType: "text/plain",
    buffer: Buffer.from("this is a test"),
  });
  expect(await page.title()).toBe("Upload");
});
