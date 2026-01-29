const prisma = require("../lib/prisma");

exports.getTenantConfiguration = async (req, res) => {
  try {
    const userId = req.user.id; // 🔐 from JWT

    const config = await prisma.tenantConfiguration.findUnique({
      where: { userId },
    });

    return res.json({
      success: true,
      data: config,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
/**
 * ============================
 * CREATE SETTINGS (ONLY ONCE)
 * ============================
 */
exports.createTenantConfiguration = async (req, res) => {
  try {
    const userId = req.user.id;

    const exists = await prisma.tenantConfiguration.findUnique({
      where: { userId },
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Settings already exist. Use update API.",
      });
    }

    const data = { ...req.body };

    if (req.file) {
      data.companyLogo = `/uploads/${req.file.filename}`;
    }

    const config = await prisma.tenantConfiguration.create({
      data: {
        ...data,
        userId, // 🔐 attach to logged in user
      },
    });

    return res.json({
      success: true,
      message: "Settings created successfully",
      data: config,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


/**
 * ============================
 * UPDATE SETTINGS
 * ============================
 */
exports.updateTenantConfiguration = async (req, res) => {
  try {
    const userId = req.user.id;

    const exists = await prisma.tenantConfiguration.findUnique({
      where: { userId },
    });

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Settings not found. Create it first.",
      });
    }

    const data = { ...req.body };

    if (req.file) {
      data.companyLogo = `/uploads/${req.file.filename}`;
    }

    const config = await prisma.tenantConfiguration.update({
      where: { userId },
      data,
    });

    return res.json({
      success: true,
      message: "Settings updated successfully",
      data: config,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
