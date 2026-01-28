const prisma = require("../lib/prisma");
module.exports = (action) => {
  return async (req, res, next) => {
    try {
      // SuperAdmin bypass
      if (req.user.role === "SUPERADMIN") return next();

      const permission = await prisma.permission.findUnique({
        where: { userId: req.user.id }
      });

      if (!permission) {
        return res.status(403).json({ message: "No permissions assigned" });
      }

      const map = {
        create: permission.canCreateInvoice,
        view: permission.canViewInvoice,
        update: permission.canUpdateInvoice,
        delete: permission.canDeleteInvoice
      };

      if (!map[action]) {
        return res.status(403).json({ message: "Permission denied" });
      }

      next();

    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
};
