const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * REGISTER USER
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "fullName, email, password are required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,              // ✅ FIX
        email,
        password: hash,
        role: role || "USER"
      }
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
/**
 * LOGIN USER / ADMIN
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET MY PROFILE
 */
exports.me = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, name: true, role: true, createdAt: true }
  });

  res.json(user);
};

/**
 * ADMIN: GET ALL USERS
 */
exports.getAllUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      permission: {
        select: {
          canCreateInvoice: true,
          canViewInvoice: true,
          canUpdateInvoice: true,
          canDeleteInvoice: true
        }
      }
    }
  });
  res.json(users);
};

/**
 * ADMIN: CREATE USER
 */
exports.createUser = async (req, res) => {
  const { email, password, name, role } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashed, name, role }
  });

  res.json(user);
};

/**
 * ADMIN: UPDATE USER
 */
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, role } = req.body;

  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: { name, role }
  });

  res.json(user);
};

/**
 * ADMIN: DELETE USER
 */
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  await prisma.user.delete({
    where: { id: Number(id) }
  });

  res.json({ success: true, message: "User deleted" });
};
