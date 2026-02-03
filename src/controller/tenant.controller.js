const prisma = require('../lib/prisma');

/**============================
 * CREATE TENANT
 * ============================*/
exports.createTenant = async (req, res) => {
  try {
    // 🔐 Extra safety (even if middleware exists)
    if (req.user.type !== "SUPERADMIN") {
      return res.status(403).json({
        message: "Only SuperAdmin can manage tenant configuration",
      });
    }

    const { name, domain } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Tenant name is required",
      });
    }

    const superAdminId = req.user.id;

    /* ============================
       1️⃣ Create Tenant
    ============================ */
    const tenant = await prisma.tenant.create({
      data: {
        name,
        createdById: superAdminId,
      },
    });

    /* ============================
       3️⃣ Response
    ============================ */
    res.status(201).json({
      success: true,
      message: "Tenant created successfully",
      tenant,
    });

  } catch (error) {
    console.error("CREATE TENANT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTenants = async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        users: true,
        subscription: true,
        configuration: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      count: tenants.length,
      tenants,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getTenantById = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: true,
        subscription: true,
        configuration: true,
      },
    });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    res.json({
      success: true,
      tenant,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        name,
        isActive,
      },
    });

    res.json({
      success: true,
      tenant,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.tenant.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Tenant deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
