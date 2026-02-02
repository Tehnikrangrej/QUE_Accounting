const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**============================
 * CREATE SUPER ADMIN
 * ============================*/
exports.createSuperAdmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingAdmin = await prisma.superAdmin.findFirst();
    if (existingAdmin) {
      return res.status(403).json({
        message: "SuperAdmin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.superAdmin.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    res.status(201).json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**============================
 * SUPER ADMIN LOGIN
 * ============================*/
exports.superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.superAdmin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, tenantId : admin.tenantId,type: "SUPERADMIN" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**============================
 *  GET SUPER ADMIN PROFILE
 * ============================*/
exports.getSuperAdmin = async (req, res) => {
  try {
    const adminId = req.user.id;

    const admin = await prisma.superAdmin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      return res.status(404).json({ message: "SuperAdmin not found" });
    }

    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**============================
 *  UPDATE SUPER ADMIN PROFILE
 * ============================*/
exports.updateSuperAdmin = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { name, email, currentPassword, newPassword } = req.body;

    const admin = await prisma.superAdmin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return res.status(404).json({ message: "SuperAdmin not found" });
    }

    // If password change requested
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          message: "Current password is required to change password",
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
    }

    const updatedData = {
      name,
      email,
    };

    if (newPassword) {
      updatedData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedAdmin = await prisma.superAdmin.update({
      where: { id: adminId },
      data: updatedData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      admin: updatedAdmin,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};