const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const requirePermission = require("../middleware/checkcustomerpermission");
const customerController = require("../controller/customer.controller");

router.use(auth);

router.post(
  "/",
  requirePermission("canCreateCustomer"),
  customerController.createCustomer
);

router.get(
  "/",
  requirePermission("canViewCustomer"),
  customerController.getAllCustomers
);

router.get(
  "/:id",
  requirePermission("canViewCustomer"),
  customerController.getCustomerById
);

router.put(
  "/:id",
  requirePermission("canUpdateCustomer"),
  customerController.updateCustomer
);

router.delete(
  "/:id",
  requirePermission("canDeleteCustomer"),
  customerController.deleteCustomer
);

module.exports = router;
