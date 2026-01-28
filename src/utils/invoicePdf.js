const PDFDocument = require("pdfkit");

module.exports = function generateInvoicePDF(invoice, res) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename=${invoice.invoiceNumber}.pdf`);

  doc.pipe(res);

  // ===== HEADER =====
  doc.fontSize(20).text("INVOICE", { align: "center" });
  doc.moveDown();

  doc.fontSize(10);
  doc.text(`Invoice No: ${invoice.invoiceNumber}`);
  doc.text(`Date: ${new Date(invoice.invoiceDate).toDateString()}`);
  doc.text(`Due Date: ${new Date(invoice.dueDate).toDateString()}`);
  doc.moveDown();

  // ===== CUSTOMER =====
  doc.fontSize(12).text("Bill To:");
  doc.text(invoice.customer.name || "Customer");
  doc.text(invoice.customer.email || "");
  doc.moveDown();

  // ===== TABLE HEADER =====
  doc.fontSize(10);
  doc.text("Item", 50, doc.y);
  doc.text("Qty", 250, doc.y);
  doc.text("Rate", 300, doc.y);
  doc.text("Amount", 400, doc.y);
  doc.moveDown();

  // ===== ITEMS =====
  invoice.items.forEach((item) => {
    doc.text(item.itemName, 50, doc.y);
    doc.text(item.qty || "", 250, doc.y);
    doc.text(item.rate.toFixed(2), 300, doc.y);
    doc.text(item.amount.toFixed(2), 400, doc.y);
    doc.moveDown();
  });

  doc.moveDown();

  // ===== TOTALS =====
  doc.text(`Subtotal: ${invoice.subTotal}`);
  doc.text(`Discount: ${invoice.discountAmount}`);
  doc.text(`Adjustment: ${invoice.adjustment}`);
  doc.fontSize(12).text(`TOTAL: ${invoice.total}`, { align: "right" });

  doc.end();
};
