const prisma = require("../lib/prisma");
const generateInvoicePdf = require("../utils/generateInvoicePdf");
const uploadInvoicePdf = require("../utils/uploadInvoicePdf");

/* ===============================
   CREATE INVOICE
================================ */
exports.createInvoice = async (req, res) => {
  try {
    const {
      customerId,
      invoiceDate,
      dueDate,
      currency = "AED",
      poNumber,
      poDate,
      adminNote,
      terms,
      discount = 0,
      items = [],
    } = req.body;

    if (!customerId || !invoiceDate || !dueDate || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "customerId, invoiceDate, dueDate and items are required",
      });
    }

    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { createdAt: "desc" },
      select: { invoiceNumber: true },
    });

    let nextNumber = 1;
    if (lastInvoice?.invoiceNumber) {
      nextNumber = Number(lastInvoice.invoiceNumber.split("-")[1]) + 1;
    }

    const invoiceNumber = `INV-${String(nextNumber).padStart(6, "0")}`;

    let subTotal = 0;
    let totalTax = 0;

    const invoiceItems = items.map((i) => {
      const hours = Number(i.hours);
      const rate = Number(i.rate);
      const amount = hours * rate;
      const taxAmount = (amount * Number(i.taxPercent || 0)) / 100;

      subTotal += amount;
      totalTax += taxAmount;

      return {
        description: i.description,
        hours,
        rate,
        taxPercent: Number(i.taxPercent || 0),
        taxAmount,
        amount,
      };
    });

    const grandTotal = subTotal + totalTax - Number(discount);

    // 💾 Create invoice (UNCHANGED)
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId,
        invoiceDate: new Date(invoiceDate),
        dueDate: new Date(dueDate),
        currency,
        poNumber,
        poDate: poDate ? new Date(poDate) : null,
        adminNote,
        terms,
        subTotal,
        totalTax,
        discount,
        grandTotal,
        items: { create: invoiceItems },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    // 📄 PDF GENERATION (ADDED)
    const tenant = await prisma.tenantConfiguration.findUnique({
      where: { userId: req.user.id },
    });

    const pdfBuffer = await generateInvoicePdf(invoice, tenant);
    const pdfUrl = await uploadInvoicePdf(pdfBuffer, invoice.invoiceNumber);

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: { pdfUrl },
      include: {
        customer: true,
        items: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Invoice created successfully & PDF generated",
      data: updatedInvoice,
    });

  } catch (error) {
    console.error("Create Invoice Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllInvoices = async (req, res) => {
  const data = await prisma.invoice.findMany({
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data });
};

exports.getInvoiceById = async (req, res) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: req.params.id },
    include: { customer: true, items: true },
  });
  if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });
  res.json({ success: true, data: invoice });
};

exports.updateInvoiceStatus = async (req, res) => {
  const invoice = await prisma.invoice.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
  });
  res.json({ success: true, data: invoice });
};

exports.deleteInvoice = async (req, res) => {
  await prisma.invoice.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Invoice deleted" });
};

exports.downloadInvoicePdf = async (req, res) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: req.params.id },
  });

  if (!invoice?.pdfUrl) {
    return res.status(404).json({
      success: false,
      message: "PDF not found",
    });
  }

  // 🔥 Force correct PDF handling
  const downloadUrl = invoice.pdfUrl.replace(
    "/upload/",
    "/upload/fl_attachment/"
  );

  res.redirect(downloadUrl);
};

