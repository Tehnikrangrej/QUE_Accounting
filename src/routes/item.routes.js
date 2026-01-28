const router = require("express").Router();
const controller = require("../controller/item.controller");

router.post("/", controller.createItem);
router.get("/", controller.getAllItems);
router.put("/:id", controller.updateItem);
router.delete("/:id", controller.deleteItem);

module.exports = router;
