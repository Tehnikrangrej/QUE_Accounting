const express = require("express");
const router = express.Router();

const {
    createTenant,
    getAllTenants,
    getTenantById ,
    updateTenant,
    deleteTenant,
}= require("../controller/tenant.controller");

const { superAdminAuth } = require("../middleware/superAdminAuth");

router.post("/", superAdminAuth, createTenant);
router.get("/", superAdminAuth, getAllTenants);
router.get("/:id", superAdminAuth, getTenantById);
router.put("/:id", superAdminAuth, updateTenant);
router.delete("/:id", superAdminAuth, deleteTenant);

module.exports = router;