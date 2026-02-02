exports.superAdminAuth = (req, res, next) => {
  if (req.user?.type !== "SUPERADMIN") {
    return res.status(403).json({
      message: "Only SuperAdmin can manage tenant configuration",
    });
  }
  next();
};
