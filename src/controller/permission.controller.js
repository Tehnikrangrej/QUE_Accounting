const prisma = require("../lib/prisma");
/* ============================
   SET / UPDATE PERMISSION
============================ */
exports.setPermission = async (req, res) => {
  try {
    const {
      userId,
      canCreateInvoice,
      canViewInvoice,
      canUpdateInvoice,
      canDeleteInvoice
    } = req.body;

    const numericUserId = Number(userId);

    const userExists = await prisma.user.findUnique({ where: { id: numericUserId } });
    if (!userExists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: numericUserId },
      data: {
        permission: {
          upsert: {
            update: {
              canCreateInvoice: !!canCreateInvoice,
              canViewInvoice: !!canViewInvoice,
              canUpdateInvoice: !!canUpdateInvoice,
              canDeleteInvoice: !!canDeleteInvoice
            },
            create: {
              canCreateInvoice: !!canCreateInvoice,
              canViewInvoice: !!canViewInvoice,
              canUpdateInvoice: !!canUpdateInvoice,
              canDeleteInvoice: !!canDeleteInvoice
            }
          }
        }
      },
      include: {
        permission: true
      }
    });

    res.json({
      success: true,
      message: "Permission saved",
      data: updatedUser.permission
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
