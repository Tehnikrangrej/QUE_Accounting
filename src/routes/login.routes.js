const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controller/login.controller");

router.post("/", controller.login);

router.get("/me", auth, controller.getMe);
module.exports = router;
