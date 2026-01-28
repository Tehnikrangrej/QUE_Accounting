const prisma = require("../lib/prisma");

/* =========================
   CREATE STAFF
========================= */
exports.createStaff = async (req, res) => {
  try {
    const { fullName, email, role, isActive } = req.body;

    if (!fullName) {
      return res.status(400).json({ success: false, message: "Full name required" });
    }

    const staff = await prisma.staff.create({
      data: { fullName, email, role, isActive }
    });

    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   GET ALL STAFF
========================= */
exports.getAllStaff = async (req, res) => {
  try {
    const list = await prisma.staff.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   UPDATE STAFF
========================= */
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.staff.update({
      where: { id },
      data: req.body
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   DELETE STAFF
========================= */
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.staff.delete({ where: { id } });
    res.json({ success: true, message: "Staff deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
