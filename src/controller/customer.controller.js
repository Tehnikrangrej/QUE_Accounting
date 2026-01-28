const prisma = require("../lib/prisma");

/* =========================
   CREATE CUSTOMER (ADMIN / SUPERADMIN)
========================= */
exports.createCustomer = async (req, res) => {
  try {
    const data = req.body;

    const customer = await prisma.customer.create({
      data,
    });

    res.json({
      success: true,
      message: "Customer created successfully",
      customer,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET ALL CUSTOMERS (ALL LOGGED IN USERS)
========================= */
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, customers });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET SINGLE CUSTOMER
========================= */
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { invoices: true },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   UPDATE CUSTOMER (ADMIN / SUPERADMIN)
========================= */
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.update({
      where: { id },
      data: req.body,
    });

    res.json({
      success: true,
      message: "Customer updated successfully",
      customer,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   DELETE CUSTOMER (SUPERADMIN ONLY)
========================= */
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.customer.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
