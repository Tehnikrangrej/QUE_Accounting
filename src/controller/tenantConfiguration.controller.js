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

    const data = { ...req.body };

    // ✅ Cloudinary URL
    if (req.file) {
      data.companyLogo = req.file.path;
    }

    const config = await prisma.tenantConfiguration.upsert({
      where: { userId },
      create: {
        ...data,
        userId,
      },
      update: {
        ...data,
      },
    });

    return res.json({
      success: true,
      message: "Settings saved successfully",
      data: config,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};