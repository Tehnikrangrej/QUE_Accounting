const router = require("express").Router();
const controller = require("../controller/permission.controller");

// Protect this with SUPERADMIN middleware
router.post("/set", controller.setPermission);

module.exports = router;
