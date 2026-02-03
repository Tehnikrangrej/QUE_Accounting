const prisma = require("../lib/prisma");

/**
 * ============================
 * CREATE CUSTOMER
 * ============================
 */
exports.createCustomer = async (req, res) => {
  try {
    let tenantId = req.user.tenantId;

    // 🔥 SUPERADMIN can choose tenant explicitly
    if (req.user.type === "SUPERADMIN") {
      tenantId = req.body.tenantId;
    }

    if (!tenantId) {
      return res.status(403).json({
        success: false,
        message: "Tenant context missing",
      });
    }

    // 🔒 Prevent spoofing by normal users
    if (req.user.type !== "SUPERADMIN") {
      delete req.body.tenantId;
    }

    const {
      company,
      vatNumber,
      phone,
      website,
      group,
      currency,
      defaultLanguage,

      address,
      city,
      state,
      zipCode,
      country,

      billingStreet,
      billingCity,
      billingState,
      billingZipCode,
      billingCountry,

      shippingStreet,
      shippingCity,
      shippingState,
      shippingZipCode,
      shippingCountry,

      sameAsBilling,
    } = req.body;

    if (!company) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    let finalShipping = {
      shippingStreet,
      shippingCity,
      shippingState,
      shippingZipCode,
      shippingCountry,
    };

    if (sameAsBilling) {
      finalShipping = {
        shippingStreet: billingStreet,
        shippingCity: billingCity,
        shippingState: billingState,
        shippingZipCode: billingZipCode,
        shippingCountry: billingCountry,
      };
    }

    const customer = await prisma.customer.create({
      data: {
        tenantId,

        company,
        vatNumber,
        phone,
        website,
        group,
        currency,
        defaultLanguage,

        address,
        city,
        state,
        zipCode,
        country,

        billingStreet,
        billingCity,
        billingState,
        billingZipCode,
        billingCountry,

        ...finalShipping,
      },
    });

    res.json({
      success: true,
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    console.error("Create customer error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ============================
 * GET ALL CUSTOMERS
 * ============================
 */
exports.getAllCustomers = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const customers = await prisma.customer.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ============================
 * GET CUSTOMER BY ID
 * ============================
 */
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const customer = await prisma.customer.findFirst({
      where: { id, tenantId },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ============================
 * UPDATE CUSTOMER
 * ============================
 */
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    delete req.body.id;
    delete req.body.tenantId;
    delete req.body.createdAt;
    delete req.body.updatedAt;

    const existing = await prisma.customer.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (req.body.sameAsBilling) {
      req.body.shippingStreet = req.body.billingStreet;
      req.body.shippingCity = req.body.billingCity;
      req.body.shippingState = req.body.billingState;
      req.body.shippingZipCode = req.body.billingZipCode;
      req.body.shippingCountry = req.body.billingCountry;
    }

    delete req.body.sameAsBilling;

    const updated = await prisma.customer.update({
      where: { id },
      data: req.body,
    });

    res.json({
      success: true,
      message: "Customer updated successfully",
      customer: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ============================
 * DELETE CUSTOMER
 * ============================
 */
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const existing = await prisma.customer.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    await prisma.customer.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
