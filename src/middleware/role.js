const requireRole = (allowedRoles = []) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

exports.isAdmin = requireRole(["SUPERADMIN"]);
exports.isSuperAdmin = requireRole(["SUPERADMIN"]);
exports.isAdminOrSuperAdmin = requireRole(["ADMIN", "SUPERADMIN"]);
