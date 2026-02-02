const prisma = require("../lib/prisma");

const resolveTenantId = async (req) => {
  // Priority: route param -> body -> token
  let tenantId = req.params?.tenantId || req.body?.tenantId || req.user?.tenantId;

  if (!tenantId && req.user?.type === "SUPERADMIN") {
    const tenant = await prisma.tenant.findFirst({
      where: { createdById: req.user.id },
      select: { id: true },
    });

    tenantId = tenant?.id;
  }

  return tenantId;
};

exports.getTenantConfiguration = async (req, res) => {
  try {
    const tenantId = await resolveTenantId(req);

    if (!tenantId) {
      return res.status(400).json({ message: "tenantId is required" });
    }

    const config = await prisma.tenantConfiguration.findUnique({
      where: { tenantId: tenantId },
    });

    if (!config) {
      return res.status(404).json({
        message: "Tenant configuration not found",
      });
    }

    res.json({
      success: true,
      config,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * CREATE or UPDATE Tenant Configuration
 * SUPERADMIN only
 */
exports.upsertTenantConfiguration = async (req, res) => {
  try {
    // ✅ tenantId can come from params, body, token, or resolved tenant
    const tenantId = await resolveTenantId(req);

    // 🔐 SUPERADMIN check (payload stores `type`)
    if (req.user.type !== "SUPERADMIN") {
      return res.status(403).json({
        message: "Only SuperAdmin can manage tenant configuration",
      });
    }

    if (!tenantId) {
      return res.status(400).json({
        message: "tenantId is required",
      });
    }

    // ☁️ Logo from Cloudinary
    const logoUrl = req.file ? req.file.path : null;

    // 🔍 Existing config
    const existing = await prisma.tenantConfiguration.findUnique({
      where: { tenantId },
    });

    // ❗ Logo mandatory on CREATE
    if (!existing && !logoUrl) {
      return res.status(400).json({
        message: "Company logo is required",
      });
    }

    const dataPayload = {
      companyName: req.body.companyName,
      address: req.body.address,
      phone: req.body.phone,
      email: req.body.email,
      website: req.body.website,
      trn: req.body.trn,

      accountName: req.body.accountName,
      accountNumber: req.body.accountNumber,
      bankAddress: req.body.bankAddress,
      bankName: req.body.bankName,

      iban: req.body.iban,
      swiftCode: req.body.swiftCode,

      defaultFooterNote: req.body.defaultFooterNote,
      defaultTerms: req.body.defaultTerms,

      ...(logoUrl && { companyLogo: logoUrl }),
    };

    let config;

    if (existing) {
      // 🔁 UPDATE
      config = await prisma.tenantConfiguration.update({
        where: { tenantId },
        data: dataPayload,
      });
    } else {
      // ➕ CREATE
      config = await prisma.tenantConfiguration.create({
        data: {
          tenantId,
          ...dataPayload,
          companyLogo: logoUrl,
        },
      });
    }

    res.json({
      success: true,
      action: existing ? "updated" : "created",
      config,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
