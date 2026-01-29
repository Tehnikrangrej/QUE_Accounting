const express = require("express");
const router = express.Router();

// Controller
const controller = require("../controller/tenantConfiguration.controller");

// Auth middleware (if you use it)

// Multer for logo upload
const multer = require("multer");
const path = require("path");

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ================================
// ROUTES
// ================================

// Get settings
router.get("/",  controller.getTenantConfiguration);

// Create settings (ONLY ONCE)
router.post("/", upload.single("companyLogo"), controller.createTenantConfiguration);

// Update settings
router.put("/",  upload.single("companyLogo"), controller.updateTenantConfiguration);

module.exports = router;
