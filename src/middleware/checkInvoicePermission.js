const prisma = require("../lib/prisma");

const checkPermission = (action) => {
  return async (req, res, next) => {
    try {
      // 🔐 SUPERADMIN → FULL ACCESS (NO PERMISSION CHECK)
      if (req.user.role === "SUPERADMIN") {
        return next();
      }

      // 👤 USER → CHECK PERMISSIONS
      const permission = await prisma.permission.findUnique({
        where: { userId: req.user.id },
      });

      if (!permission) {
        return res.status(403).json({
          success: false,
          message: "No permissions assigned",
        });
      }

      const map = {
        create: permission.canCreateInvoice,
        view: permission.canViewInvoice,
        update: permission.canUpdateInvoice,
        delete: permission.canDeleteInvoice,
      };

      if (!map[action]) {
        return res.status(403).json({
          success: false,
          message: `You do not have permission to ${action} invoices`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
};
const customerPermission = (action) => {
  return async (req, res, next) => {
    try {
      // 👑 SUPERADMIN → full access
      if (req.user.type === "SUPERADMIN") {
        return next();
      }

      // 👤 USER → fetch permission
      const permission = await prisma.permission.findUnique({
        where: { userId: Number(req.user.id) },

      });

      if (!permission) {
        return res.status(403).json({
          success: false,
          message: "No permissions assigned",
        });
      }

      const map = {
        create: permission.canCreateCustomer,
        view: permission.canViewCustomer,
        update: permission.canUpdateCustomer,
        delete: permission.canDeleteCustomer,
      };

      if (!map[action]) {
        return res.status(403).json({
          success: false,
          message: `You do not have permission to ${action} customers`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
};

module.exports = customerPermission;


module.exports = checkPermission;
