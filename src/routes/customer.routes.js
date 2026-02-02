const router = require("express").Router();
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/Permission")
const controller = require("../controller/customer.controller");

// ============================
// VIEW
// ============================
router.get(
  "/",
  auth,
  requirePermission("canViewCustomer"),
  controller.getAllCustomers
);

router.get(
  "/:id",
  auth,
  requirePermission("canViewCustomer"),
  controller.getCustomerById
);

// ============================
// CREATE
// ============================
router.post(
  "/",
  auth,
  requirePermission("canCreateCustomer"),
  controller.createCustomer
);

// ============================
// UPDATE
// ============================
router.put(
  "/:id",
  auth,
  requirePermission("canUpdateCustomer"),
  controller.updateCustomer
);

// ============================
// DELETE
// ============================
router.delete(
  "/:id",
  auth,
  requirePermission("canDeleteCustomer"),
  controller.deleteCustomer
);

module.exports = router;
