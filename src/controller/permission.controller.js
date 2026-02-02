const prisma = require("../lib/prisma");

/* ============================
   SET / UPDATE PERMISSION
   SUPERADMIN ONLY
============================ */
exports.setPermission = async (req, res) => {
  try {
    // 👑 SuperAdmin check
    if (req.user.type !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only SuperAdmin can set permissions",
      });
    }

    const {
      userId,

      // INVOICE
      canCreateInvoice,
      canViewInvoice,
      canUpdateInvoice,
      canDeleteInvoice,

      // CUSTOMER
      canCreateCustomer,
      canViewCustomer,
      canUpdateCustomer,
      canDeleteCustomer,

      // TENANT
      canEditTenantConfig,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // ⚠️ adjust this if user.id is String in schema
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        permission: {
          upsert: {
            update: {
              // INVOICE
              canCreateInvoice: !!canCreateInvoice,
              canViewInvoice: !!canViewInvoice,
              canUpdateInvoice: !!canUpdateInvoice,
              canDeleteInvoice: !!canDeleteInvoice,

              // CUSTOMER
              canCreateCustomer: !!canCreateCustomer,
              canViewCustomer: !!canViewCustomer,
              canUpdateCustomer: !!canUpdateCustomer,
              canDeleteCustomer: !!canDeleteCustomer,

              // TENANT
              canEditTenantConfig: !!canEditTenantConfig,
            },
            create: {
              // INVOICE
              canCreateInvoice: !!canCreateInvoice,
              canViewInvoice: !!canViewInvoice,
              canUpdateInvoice: !!canUpdateInvoice,
              canDeleteInvoice: !!canDeleteInvoice,

              // CUSTOMER
              canCreateCustomer: !!canCreateCustomer,
              canViewCustomer: !!canViewCustomer,
              canUpdateCustomer: !!canUpdateCustomer,
              canDeleteCustomer: !!canDeleteCustomer,

              // TENANT
              canEditTenantConfig: !!canEditTenantConfig,
            },
          },
        },
      },
      include: {
        permission: true,
      },
    });

    return res.json({
      success: true,
      message: "Permission saved successfully",
      data: updatedUser.permission,
    });
  } catch (error) {
    console.error("Set permission error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
