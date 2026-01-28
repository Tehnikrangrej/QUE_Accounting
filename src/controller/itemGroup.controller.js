const prisma = require("../lib/prisma");

exports.createGroup = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    const group = await prisma.itemGroup.create({ data: { name, isActive } });
    res.json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllGroups = async (req, res) => {
  try {
    const groups = await prisma.itemGroup.findMany({ orderBy: { name: "asc" } });
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.itemGroup.update({
      where: { id },
      data: req.body
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.itemGroup.delete({ where: { id } });
    res.json({ success: true, message: "Group deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
