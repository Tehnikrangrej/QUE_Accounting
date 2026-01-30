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
 * CREATE OR UPDATE SETTINGS
 * ============================
 */
exports.saveTenantConfiguration = async (req, res) => {
  try {
    const userId = req.user.id;

    const exists = await prisma.tenantConfiguration.findUnique({
      where: { userId },
    });

    const data = { ...req.body };

    if (req.file) {
      data.companyLogo = `/uploads/${req.file.filename}`;
    }

    let config;

    if (!exists) {
      // 🆕 CREATE
      config = await prisma.tenantConfiguration.create({
        data: {
          ...data,
          userId,
        },
      });

      return res.json({
        success: true,
        message: "Settings created successfully",
        data: config,
      });
    }

    // ✏️ UPDATE
    config = await prisma.tenantConfiguration.update({
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
