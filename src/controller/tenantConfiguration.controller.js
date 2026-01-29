const prisma = require ("../lib/prisma");

exports.getTenantConfiguration = async (req, res) => {
  const config = await prisma.tenantConfiguration.findUnique({
    where: { id: 1 },
  });

  return res.json({
    success: true,
    data: config,
  });
};
exports.createTenantConfiguration = async (req, res) => {
  try {
    const exists = await prisma.tenantConfiguration.findUnique({
      where: { id: 1 },
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Tenant configuration already exists. Use update API.",
      });
    }

    const data = req.body;

    if (req.file) {
      data.companyLogo = `/uploads/${req.file.filename}`;
    }

    const config = await prisma.tenantConfiguration.create({
      data: {
        id: 1, // 🔒 force single row
        ...data,
      },
    });

    return res.json({
      success: true,
      message: "Tenant configuration created",
      data: config,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTenantConfiguration = async (req, res) => {
  try {
    const exists = await prisma.tenantConfiguration.findUnique({
      where: { id: 1 },
    });

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Tenant configuration does not exist. Create it first.",
      });
    }

    const data = req.body;

    if (req.file) {
      data.companyLogo = `/uploads/${req.file.filename}`;
    }

    const config = await prisma.tenantConfiguration.update({
      where: { id: 1 },
      data,
    });

    return res.json({
      success: true,
      message: "Tenant configuration updated",
      data: config,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
