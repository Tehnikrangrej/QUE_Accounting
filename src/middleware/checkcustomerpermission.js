const prisma = require("../lib/prisma");

const requirePermission = (permissionField) => {
  return async (req, res, next) => {
    try {
      // 🔥 SUPERADMIN bypass
      if (req.user.type === "SUPERADMIN") {
        return next();
      }

      const permission = await prisma.permission.findUnique({
        where: {
          userId: req.user.id,
        },
      });

      if (!permission || !permission[permissionField]) {
        return res.status(403).json({
          success: false,
          message: "Permission denied",
        });
      }

      next();
    } catch (error) {
      console.error("PERMISSION ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Permission check failed",
      });
    }
  };
};

module.exports = requirePermission;
