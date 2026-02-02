const router = require("express").Router();
const controller = require("../controller/permission.controller");
const auth = require("../middleware/auth");

// Protect this with SUPERADMIN middleware
router.post("/set", auth,controller.setPermission);

module.exports = router;
