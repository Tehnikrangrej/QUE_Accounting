const prisma = require("../lib/prisma");

module.exports = async (req, res, next) => {
  const tenantId = req.user.tenantId;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { subscription: true },
  });

  if (
    !tenant ||
    !tenant.isActive ||
    tenant.subscription?.status !== "ACTIVE"
  ) {
    return res.status(403).json({
      message: "Subscription inactive or expired",
    });
  }

  next();
};
