const prisma = require("../lib/prisma");
const generateInvoicePdf = require("../utils/generateInvoicePdf");
const uploadInvoicePdf = require("../utils/uploadInvoicePdf");

/* ===============================
   CREATE INVOICE
================================ */
exports.createInvoice = async (req, res) => {
  try {
    let tenantId = req.user.tenantId;

    // 🔥 SUPERADMIN can pass tenantId explicitly
    if (req.user.type === "SUPERADMIN") {
      tenantId = req.body.tenantId;
    }

    if (!tenantId) {
      return res.status(403).json({
        success: false,
        message: "Tenant context missing",
      });
    }

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

    /* 🔒 Validate customer belongs to tenant */
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, tenantId },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found for this tenant",
      });
    }

    /* 🔢 Invoice number PER TENANT */
    const lastInvoice = await prisma.invoice.findFirst({
      where: { tenantId },
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

    /* 💾 Create Invoice */
    const invoice = await prisma.invoice.create({
      data: {
        tenantId,
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

    /* 📄 Generate PDF using TENANT config */
    const tenantConfig = await prisma.tenantConfiguration.findUnique({
      where: { tenantId },
    });

    const pdfBuffer = await generateInvoicePdf(invoice, tenantConfig);
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
      message: "Invoice created successfully",
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

/* ===============================
   GET ALL INVOICES
================================ */
exports.getAllInvoices = async (req, res) => {
  const tenantId = req.user.tenantId;

  const data = await prisma.invoice.findMany({
    where: { tenantId },
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, data });
};

/* ===============================
   GET INVOICE BY ID
================================ */
exports.getInvoiceById = async (req, res) => {
  const tenantId = req.user.tenantId;

  const invoice = await prisma.invoice.findFirst({
    where: { id: req.params.id, tenantId },
    include: { customer: true, items: true },
  });

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: "Invoice not found",
    });
  }

  res.json({ success: true, data: invoice });
};

/* ===============================
   UPDATE INVOICE STATUS
================================ */
exports.updateInvoiceStatus = async (req, res) => {
  const tenantId = req.user.tenantId;

  const invoice = await prisma.invoice.updateMany({
    where: { id: req.params.id, tenantId },
    data: { status: req.body.status },
  });

  if (!invoice.count) {
    return res.status(404).json({
      success: false,
      message: "Invoice not found",
    });
  }

  res.json({ success: true, message: "Invoice status updated" });
};

/* ===============================
   DELETE INVOICE
================================ */
exports.deleteInvoice = async (req, res) => {
  const tenantId = req.user.tenantId;

  const deleted = await prisma.invoice.deleteMany({
    where: { id: req.params.id, tenantId },
  });

  if (!deleted.count) {
    return res.status(404).json({
      success: false,
      message: "Invoice not found",
    });
  }

  res.json({ success: true, message: "Invoice deleted" });
};

/* ===============================
   DOWNLOAD PDF
================================ */
exports.downloadInvoicePdf = async (req, res) => {
  const tenantId = req.user.tenantId;

  const invoice = await prisma.invoice.findFirst({
    where: { id: req.params.id, tenantId },
  });

  if (!invoice?.pdfUrl) {
    return res.status(404).json({
      success: false,
      message: "PDF not found",
    });
  }

  const downloadUrl = invoice.pdfUrl.replace(
    "/upload/",
    "/upload/fl_attachment/"
  );

  res.redirect(downloadUrl);
};
