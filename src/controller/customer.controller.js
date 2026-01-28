const prisma = require("../lib/prisma");

/**
 * ============================
 * CREATE CUSTOMER (ADMIN / SUPERADMIN)
 * ============================
 */
exports.createCustomer = async (req, res) => {
  try {
    const {
      company,
      vatNumber,
      phone,
      website,
      group,
      currency,
      defaultLanguage,

      // main address
      address,
      city,
      state,
      zipCode,
      country,

      // billing
      billingStreet,
      billingCity,
      billingState,
      billingZipCode,
      billingCountry,

      // shipping
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

    return res.json({
      success: true,
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    console.error("Create customer error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ============================
 * GET ALL CUSTOMERS (ALL LOGGED IN USERS)
 * ============================
 */
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Get all customers error:", error);
    return res.status(500).json({
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

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Get customer error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
  
};

/**
 * ============================
 * UPDATE CUSTOMER (ADMIN / SUPERADMIN)
 * ============================
 */
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // prevent dangerous updates
    delete req.body.id;
    delete req.body.createdAt;
    delete req.body.updatedAt;

    const existing = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // handle sameAsBilling logic
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

    return res.json({
      success: true,
      message: "Customer updated successfully",
      customer: updated,
    });
  } catch (error) {
    console.error("Update customer error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ============================
 * DELETE CUSTOMER (SUPERADMIN ONLY)
 * ============================
 */
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.customer.findUnique({
      where: { id },
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

    return res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

