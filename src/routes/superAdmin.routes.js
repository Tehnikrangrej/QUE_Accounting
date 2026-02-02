const express = require("express");
const router = express.Router();

const {
  createSuperAdmin,
  superAdminLogin,
  getSuperAdmin,
  updateSuperAdmin,
} = require("../controller/superAdmin.controller");

const { superAdminAuth } = require("../middleware/superAdminAuth");
router.post("/",createSuperAdmin);
/**
 * AUTH
 */
router.post("/login", superAdminLogin);

/**
 * SUPERADMIN MANAGEMENT
 * (only logged-in SuperAdmin)
 */
router.get("/me", superAdminAuth, getSuperAdmin);
router.put("/me", superAdminAuth, updateSuperAdmin);

module.exports = router;
