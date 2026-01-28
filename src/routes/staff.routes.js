const router = require("express").Router();
const controller = require("../controller/staff.controller");

router.post("/", controller.createStaff);
router.get("/", controller.getAllStaff);
router.put("/:id", controller.updateStaff);
router.delete("/:id", controller.deleteStaff);

module.exports = router;
