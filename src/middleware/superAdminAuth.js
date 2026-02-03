exports.superAdminAuth = (req, res, next) => {
  const isSuperAdmin =
    req.user?.type === "SUPERADMIN" || req.user?.role === "SUPERADMIN";

  if (!isSuperAdmin) {
    return res.status(403).json({
      message: "Only SuperAdmin can manage tenant configuration",
    });
  }

  next();
};
