const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    /* ============================
       1️⃣ Check SuperAdmin first
    ============================ */
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { email },
    });

    if (superAdmin) {
      const match = await bcrypt.compare(password, superAdmin.password);
      if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
          id: superAdmin.id,
          tenantId: superAdmin.tenantId,
          role: "SUPERADMIN",
          type: "SUPERADMIN",
          isBootstrapped: !!superAdmin.tenantId,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        success: true,
        token,
        userType: "SUPERADMIN",
        isBootstrapped: !!superAdmin.tenantId,
        user: {
          id: superAdmin.id,
          name: superAdmin.name,
          email: superAdmin.email,
          role: "SUPERADMIN",
        },
        tenant: superAdmin.tenantId || null,
      });
    }

    /* ============================
       2️⃣ Check User
    ============================ */
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        permission: true,
        tenant: true, // ✅ CORRECT
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account is inactive",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        tenantId: user.tenantId,
        role: user.role,
        type: "USER",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      token,
      userType: "USER",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permission: user.permission,
      },
      tenant: user.tenant, // ✅ FULL TENANT OBJECT
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
