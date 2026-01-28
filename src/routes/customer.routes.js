const router = require("express").Router();
const auth = require("../middleware/auth");
const { isAdminOrSuperAdmin, isSuperAdmin } = require("../middleware/role");

const controller = require("../controller/customer.controller");

// All logged in users
router.get("/", auth, controller.getAllCustomers);
router.get("/:id", auth, controller.getCustomerById);

// Admin / SuperAdmin
router.post("/", auth, isAdminOrSuperAdmin, controller.createCustomer);
router.put("/:id", auth, isAdminOrSuperAdmin, controller.updateCustomer);

// SuperAdmin only
router.delete("/:id", auth, isSuperAdmin, controller.deleteCustomer);
// ================================
// CUSTOMER ADMINS
// ================================

// Assign admin to customer
router.post(
  "/:id/admins",
  auth,
  isAdminOrSuperAdmin,
  controller.assignAdmin
);

// Remove admin from customer
router.delete(
  "/:id/admins/:userId",
  auth,
  isAdminOrSuperAdmin,
  controller.removeAdmin
);
module.exports = router;
