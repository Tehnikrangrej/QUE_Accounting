const express = require("express");
const router = express.Router();

const {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
} = require("../controller/tenant.controller");

const auth = require("../middleware/auth");
const { superAdminAuth } = require("../middleware/superAdminAuth");

router.post("/", auth, superAdminAuth, createTenant);
router.get("/", auth, superAdminAuth, getAllTenants);
router.get("/:id", auth, superAdminAuth, getTenantById);
router.put("/:id", auth, superAdminAuth, updateTenant);
router.delete("/:id", auth, superAdminAuth, deleteTenant);

module.exports = router;