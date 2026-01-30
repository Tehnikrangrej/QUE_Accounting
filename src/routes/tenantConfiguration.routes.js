const express = require("express");
const router = express.Router();

// Auth middleware (JWT)
const authMiddleware = require("../middleware/auth");

// Controller
const controller = require("../controller/tenantConfiguration.controller");

// Cloudinary upload middleware
const upload = require("../middleware/cloudUpload");

/* ================================
   TENANT CONFIGURATION ROUTES
================================ */

/**
 * GET Tenant Configuration
 * - Used to load settings page
 * - Returns null if not created
 */
router.get(
  "/",
  authMiddleware,
  controller.getTenantConfiguration
);

/**
 * CREATE OR UPDATE Tenant Configuration
 * - First time → CREATE
 * - Next time → UPDATE
 * - Uploads company logo to Cloudinary
 */
router.post(
  "/",
  authMiddleware,
  upload.single("companyLogo"), // cloud upload
  controller.saveTenantConfiguration
);

module.exports = router;
