module.exports = (action) => {
  return (req, res, next) => {

    // 🔥 SUPERADMIN = FULL ACCESS (NO CHECKS)
    if (req.user.role === "SUPERADMIN") {
      return next();
    }

    // ❌ Non-superadmin without permission row
    if (!req.user.permission) {
      return res.status(403).json({
        success: false,
        message: "Permission not assigned"
      });
    }

    const p = req.user.permission;

    const permissionMap = {
      create: p.canCreateInvoice,
      view: p.canViewInvoice,
      update: p.canUpdateInvoice,
      delete: p.canDeleteInvoice
    };

    if (!permissionMap[action]) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    next();
  };
};
