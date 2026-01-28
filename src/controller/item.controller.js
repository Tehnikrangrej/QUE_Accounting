const prisma = require("../lib/prisma");
exports.createItem = async (req, res) => {
  try {
    const { name, longDesc, rate, unit, groupId, tax1Id, tax2Id, isActive } = req.body;

    const item = await prisma.item.create({
      data: {
        name,
        longDesc,
        rate: Number(rate),
        unit,
        groupId,
        tax1Id,
        tax2Id,
        isActive
      }
    });

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllItems = async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      include: { group: true, tax1: true, tax2: true },
      orderBy: { createdAt: "desc" }
    });

    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.item.update({
      where: { id },
      data: req.body
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.item.delete({ where: { id } });

    res.json({ success: true, message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
