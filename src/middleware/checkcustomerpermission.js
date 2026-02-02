const prisma = require("../lib/prisma");

const requirePermission = (permissionKey) => {
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

      if (!permission[permissionKey]) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action",
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

module.exports = { requirePermission };
