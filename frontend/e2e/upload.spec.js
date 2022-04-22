import { test, expect } from "@playwright/test";
import path from "path";

/**
 * Test the default screen.
 */
test("Checks if initial page is upload", async ({ page }) => {
  const name = await page.innerText(".heading");
  expect(name).toBe("Upload");
});

/**
 * Test base path:
 * Academic uploads journal article as a PDF
 * Academic configures range of pages to be summarised (DEPRECATED, THIS IS NO LONGER AN OPTION)
 * PDF gets parsed and the output gets computed
 * Present summary to the academic
 * Academic configures settings
 * Academic downloads the summary as a PDF
 */

/**
 * Test for when academic uploads journal article as a PDF
 */
test("If uploads a PDF, switch to display screen", async ({ page }) => {
  await page.setInputFiles("input#pdfpicker-file", {
    name: "file.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("this is test"),
  });
  const name = await page.innerText(".heading");
  expect(name).toBe("Display");
});

/**
 * Test for when academic uploads a none PDF file
 */
test("If uploads a NON-PDF, stay on upload screen", async ({ page }) => {
  await page.setInputFiles("input#pdfpicker-file", {
    name: "file.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("this is test"),
  });
  const name = await page.innerText(".heading");
  expect(name).toBe("Upload");
});

/**
 * Test for when academic uploads an empty file
 */
test("If uploads a empty PDF, stay on upload screen", async ({ page }) => {
  await page.setInputFiles("input#pdfpicker-file", {
    name: "file.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from(""),
  });
  const name = await page.innerText(".heading");
  expect(name).toBe("Upload");
});

/**
 * Test for text file which somehow has a pdf mime type.
 */
test("If uploads a text file with a pdf mime type, stay on upload screen", async ({
  page,
}) => {
  await page.setInputFiles("input#pdfpicker-file", {
    name: "file.txt",
    mimeType: "application/pdf",
    buffer: Buffer.from("this is a test"),
  });
  const name = await page.innerText(".heading");
  expect(name).toBe("Upload");
});

/**
 * Test for pdf file which somehow has a text mime type.
 */
test("If uploads a pdf file with a text mime type, stay on upload screen", async ({
  page,
}) => {
  await page.setInputFiles("input#pdfpicker-file", {
    name: "file.pdf",
    mimeType: "text/plain",
    buffer: Buffer.from("this is a test"),
  });
  const name = await page.innerText(".heading");
  expect(name).toBe("Upload");
});
