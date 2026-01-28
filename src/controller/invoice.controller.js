const prisma = require("../lib/prisma");

/* ===============================
   CREATE INVOICE
================================ */
exports.createInvoice = async (req, res) => {
  try {
    const {
      customerId,
      saleAgentId,
      invoiceDate,
      dueDate,
      currency = "USD",
      paymentMode,
      tags,
      quantityType = "QTY",
      isRecurring = false,
      recurringEvery,
      recurringStart,
      recurringEnd,
      preventReminder = false,
      discountType,
      discountValue = 0,
      adjustment = 0,
      adminNote,
      clientNote,
      terms,
      status = "DRAFT",
      street,
      city,
      state,
      zipCode,
      country,
      items = []
    } = req.body;

    if (!customerId || !invoiceDate || !dueDate || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "customerId, invoiceDate, dueDate and items are required"
      });
    }

    // 🔢 Invoice number
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${String(count + 1).padStart(6, "0")}`;

    let subTotal = 0;
    let totalTax = 0;

    const invoiceItems = [];

    for (const row of items) {
      let itemMaster = null;

      if (row.itemId) {
        itemMaster = await prisma.item.findUnique({
          where: { id: row.itemId },
          include: { tax1: true, tax2: true }
        });
        if (!itemMaster) {
          return res.status(400).json({
            success: false,
            message: `Item not found: ${row.itemId}`
          });
        }
      }

      const qty = Number(row.qty || 1);
      const hours = Number(row.hours || 0);
      const rate = Number(row.rate || itemMaster?.rate || 0);

      const baseAmount =
        quantityType === "HOURS" ? hours * rate : qty * rate;

      let taxRate = 0;
      let taxName = null;

      if (itemMaster?.tax1) {
        taxRate += itemMaster.tax1.rate;
        taxName = itemMaster.tax1.name;
      }
      if (itemMaster?.tax2) {
        taxRate += itemMaster.tax2.rate;
        taxName = taxName
          ? taxName + ", " + itemMaster.tax2.name
          : itemMaster.tax2.name;
      }

      const taxAmount = (baseAmount * taxRate) / 100;
      const finalAmount = baseAmount + taxAmount;

      subTotal += baseAmount;
      totalTax += taxAmount;

      invoiceItems.push({
        itemId: row.itemId || null,
        itemName: row.itemName || itemMaster?.name || "Custom Item",
        description: row.description || itemMaster?.longDesc || null,
        qty,
        hours,
        rate,
        taxName,
        taxRate,
        taxAmount,
        amount: finalAmount
      });
    }

    // 🧮 Discount
    let discountAmount = 0;
    if (discountType === "PERCENT") {
      discountAmount = (subTotal * discountValue) / 100;
    } else if (discountType === "FIXED") {
      discountAmount = discountValue;
    }

    const total =
      subTotal + totalTax - discountAmount + Number(adjustment || 0);

    // 💾 Save
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId,
        saleAgentId,
        invoiceDate: new Date(invoiceDate),
        dueDate: new Date(dueDate),
        currency,
        paymentMode,
        tags,
        quantityType,
        isRecurring,
        recurringEvery,
        recurringStart: recurringStart ? new Date(recurringStart) : null,
        recurringEnd: recurringEnd ? new Date(recurringEnd) : null,
        preventReminder,
        subTotal,
        discountType,
        discountValue,
        discountAmount,
        adjustment,
        total,
        adminNote,
        clientNote,
        terms,
        status,
        street,
        city,
        state,
        zipCode,
        country,
        items: {
          create: invoiceItems
        }
      },
      include: {
        items: true,
        customer: true,
        saleAgent: true
      }
    });

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice
    });

  } catch (error) {
    console.error("Create Invoice Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create invoice",
      error: error.message
    });
  }
};

/* ===============================
   GET ALL
================================ */
exports.getAllInvoices = async (req, res) => {
  try {
    const list = await prisma.invoice.findMany({
      include: {
        customer: true,
        saleAgent: true,
        items: true
      },
      orderBy: { createdAt: "desc" }
    });
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===============================
   GET ONE
================================ */
exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        saleAgent: true,
        items: { include: { item: true } }
      }
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===============================
   DELETE
================================ */
exports.deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.invoice.delete({ where: { id } });
    res.json({ success: true, message: "Invoice deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===============================
   UPDATE STATUS
================================ */
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.invoice.update({
      where: { id },
      data: { status }
    });

    res.json({ success: true, message: "Status updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const generateInvoicePDF = require("../utils/invoicePdf");

exports.downloadInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true
      }
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    generateInvoicePDF(invoice, res);

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
