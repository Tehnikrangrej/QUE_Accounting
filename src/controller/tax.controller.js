const prisma = require("../lib/prisma");
exports.createTax = async (req, res) => {
  try {
    const { name, rate, isActive } = req.body;
    const tax = await prisma.tax.create({
      data: { name, rate: Number(rate), isActive }
    });
    res.json({ success: true, data: tax });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllTaxes = async (req, res) => {
  try {
    const list = await prisma.tax.findMany({ orderBy: { name: "asc" } });
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTax = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.tax.update({
      where: { id },
      data: req.body
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTax = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.tax.delete({ where: { id } });
    res.json({ success: true, message: "Tax deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
