const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * REGISTER USER
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, tenantId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password, Tenant ID required" });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        tenantId,
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email , tenantId: user.tenantId},
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/**
 * LOGIN USER / ADMIN
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { tenant: true },
  });

  if (!user) return res.status(404).json({ message: "User not found" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid password" });

  const token = jwt.sign(
    {
      id: user.id,
      tenantId: user.tenantId,
      type: "USER",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
};


/**
 * GET MY PROFILE
 */
exports.me = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      tenantId: true,
      createdAt: true,
    },
  });

  res.json({ success: true, user });
};


/**
 * ADMIN: GET ALL USERS
 */
exports.getAllUsers = async (req, res) => {
  if (req.user.type !== "SUPERADMIN") {
    return res.status(403).json({ message: "SuperAdmin only" });
  }

  const users = await prisma.user.findMany({
    where: { tenantId: req.user.tenantId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  res.json({ success: true, users });
};


exports.createUserBySuperAdmin = async (req, res) => {
  try {
    const { name, email, password, tenantId } = req.body;

    // basic validation
    if (!name || !email || !password || !tenantId) {
      return res.status(400).json({
        message: "name, email, password and tenantId are required",
      });
    }

    // check tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return res.status(404).json({
        message: "Tenant not found",
      });
    }

    // check user already exists
    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isActive: true,

        // 🔥 tenant from BODY (simple)
        tenant: {
          connect: {
            id: tenantId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        tenantId: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/** ADD USER TO TENANT */
exports.addUserToTenant = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // TEMP: tenantId body se lo (debug/simple ke liye)
    const tenantId = req.body.tenantId;

    if (!name || !email || !password || !tenantId) {
      return res.status(400).json({
        message: "name, email, password and tenantId are required",
      });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isActive: true,

        // 🔥 THIS IS THE FIX
        tenant: {
          connect: {
            id: tenantId,
          },
        },

        permission: {
          create: {},
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        tenantId: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/** GET BY ID */
exports.getUserById = async (req, res) => {
  const user = await prisma.user.findFirst({
    where: {
      id: Number(req.params.id),
      tenantId: req.user.tenantId,
    },
  });

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ success: true, user });
};

/** UPDATE USER
 */

exports.updateUser = async (req, res) => {
  const { id } = req.params;

  // USER can update only himself
  if (req.user.type === "USER" && Number(id) !== req.user.id) {
    return res.status(403).json({ message: "Not allowed" });
  }

  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: req.body,
  });

  res.json({ success: true, user });
};

/** DELETE USER
 */
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  if (req.user.type === "USER" && Number(id) !== req.user.id) {
    return res.status(403).json({ message: "Not allowed" });
  }

  await prisma.user.delete({
    where: { id: Number(id) },
  });

  res.json({ success: true, message: "User deleted" });
};


