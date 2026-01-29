const router = require("express").Router();
const auth = require("../middleware/auth");
const { isAdmin } = require("../middleware/role");

const controller = require("../controller/user.controller");

// Public
router.post("/register", controller.register);
router.post("/login", controller.login);

// Logged in user
router.get("/me", auth, controller.me);

// SuperAdmin only
router.get("/", auth, isAdmin, controller.getAllUsers);
router.post("/", auth, isAdmin, controller.createUser);
router.put("/:id", auth, isAdmin, controller.updateUser);
router.delete("/:id", auth, isAdmin, controller.deleteUser);
router.post("/change-password", auth, controller.adminResetUserPassword);
module.exports = router;
