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


module.exports = router;
