const prisma = require("../lib/prisma");
const generateInvoicePdf = require("../utils/generateInvoicePdf");
const uploadInvoicePdf = require("../utils/uploadInvoicePdf");

/* =====================================================
   HELPER: RESOLVE CREATOR DETAILS (USER / SUPERADMIN)
===================================================== */
async function getCreatorDetails(createdById, createdByType) {
  if (createdByType === "SUPERADMIN") {
    return prisma.superAdmin.findUnique({
      where: { id: createdById },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        tenants: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // USER
  return prisma.user.findUnique({
    where: { id: createdById },
    select: {
      id: true,
      name: true,
      email: true,
      tenantId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      permission: true,
      tenant: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

/* =====================================================
   CREATE INVOICE
===================================================== */
exports.createInvoice = async (req, res) => {
  try {
    let tenantId = req.user.tenantId;

    // 🔥 SUPERADMIN explicitly passes tenantId
    if (req.user.type === "SUPERADMIN") {
      tenantId = req.body.tenantId;
    }

    if (!tenantId) {
      return res.status(403).json({
        success: false,
        message: "Tenant context missing",
      });
    }

    // prevent spoofing
    if (req.user.type !== "SUPERADMIN") {
      delete req.body.tenantId;
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

    /* 🔢 Invoice number per tenant */
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

    /* 💾 CREATE INVOICE */
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

        createdById: req.user.id,
        createdByType: req.user.type, // SUPERADMIN | USER

        items: {
          create: invoiceItems,
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    /* 📄 PDF GENERATION */
    const tenantConfig = await prisma.tenantConfiguration.findUnique({
      where: { tenantId },
    });

    if (tenantConfig) {
      const pdfBuffer = await generateInvoicePdf(invoice, tenantConfig);
      const pdfUrl = await uploadInvoicePdf(pdfBuffer, invoice.invoiceNumber);

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { pdfUrl },
      });
    }

    const createdBy = await getCreatorDetails(
      invoice.createdById,
      invoice.createdByType
    );

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: {
        ...invoice,
        createdBy,
      },
    });

  } catch (error) {
    console.error("CREATE INVOICE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   GET ALL INVOICES (TENANT SCOPED)
===================================================== */
exports.getAllInvoices = async (req, res) => {
  const tenantId = req.user.tenantId;

  const invoices = await prisma.invoice.findMany({
    where: { tenantId },
    include: {
      customer: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    success: true,
    count: invoices.length,
    data: invoices,
  });
};

/* =====================================================
   GET INVOICE BY ID (WITH CREATOR DETAILS)
===================================================== */
exports.getInvoiceById = async (req, res) => {
  const tenantId = req.user.tenantId;

  const invoice = await prisma.invoice.findFirst({
    where: { id: req.params.id, tenantId },
    include: {
      customer: true,
      items: true,
    },
  });

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: "Invoice not found",
    });
  }

  const createdBy = await getCreatorDetails(
    invoice.createdById,
    invoice.createdByType
  );

  res.json({
    success: true,
    data: {
      ...invoice,
      createdBy,
    },
  });
};

/* =====================================================
   UPDATE INVOICE STATUS
===================================================== */
exports.updateInvoiceStatus = async (req, res) => {
  const tenantId = req.user.tenantId;

  const result = await prisma.invoice.updateMany({
    where: { id: req.params.id, tenantId },
    data: { status: req.body.status },
  });

  if (!result.count) {
    return res.status(404).json({
      success: false,
      message: "Invoice not found",
    });
  }

  res.json({
    success: true,
    message: "Invoice status updated",
  });
};

/* =====================================================
   DELETE INVOICE
===================================================== */
exports.deleteInvoice = async (req, res) => {
  const tenantId = req.user.tenantId;

  const result = await prisma.invoice.deleteMany({
    where: { id: req.params.id, tenantId },
  });

  if (!result.count) {
    return res.status(404).json({
      success: false,
      message: "Invoice not found",
    });
  }

  res.json({
    success: true,
    message: "Invoice deleted",
  });
};

/* =====================================================
   DOWNLOAD INVOICE PDF
===================================================== */
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
