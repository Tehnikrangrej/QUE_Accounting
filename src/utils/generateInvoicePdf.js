const puppeteer = require("puppeteer");
const invoiceTemplate = require("./invoiceTemplate");

module.exports = async (invoice, tenant) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  const html = invoiceTemplate(invoice, tenant);

  await page.setContent(html, {
    waitUntil: "networkidle0",
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  if (!pdfBuffer || pdfBuffer.length < 2000) {
    throw new Error("PDF generation failed");
  }

  return pdfBuffer;
};
