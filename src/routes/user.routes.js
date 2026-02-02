const router = require("express").Router();
const auth = require("../middleware/auth");

const controller = require("../controller/user.controller");

router.post("/register", controller.register);
router.post("/login", controller.login);

router.get("/me", auth, controller.me);

// SUPERADMIN actions (tenant scoped)
router.post("/",controller.createUserBySuperAdmin);
router.post("/adduser", auth, controller.addUserToTenant);
router.get("/", auth, controller.getAllUsers);
router.get("/:id", auth, controller.getUserById);
router.put("/:id", auth, controller.updateUser);
router.delete("/:id", auth, controller.deleteUser);

module.exports = router;
