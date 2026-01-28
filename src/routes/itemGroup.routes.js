const router = require("express").Router();
const controller = require("../controller/itemGroup.controller");

router.post("/", controller.createGroup);
router.get("/", controller.getAllGroups);
router.put("/:id", controller.updateGroup);
router.delete("/:id", controller.deleteGroup);

module.exports = router;
