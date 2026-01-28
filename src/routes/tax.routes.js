const router = require("express").Router();
const controller = require("../controller/tax.controller");

router.post("/", controller.createTax);
router.get("/", controller.getAllTaxes);
router.put("/:id", controller.updateTax);
router.delete("/:id", controller.deleteTax);

module.exports = router;
