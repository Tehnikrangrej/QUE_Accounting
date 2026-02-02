module.exports = (req, res, next) => {
  if (!req.user.tenantId) {
    return res.status(403).json({
      message: "Tenant access required",
    });
  }
  next();
};
