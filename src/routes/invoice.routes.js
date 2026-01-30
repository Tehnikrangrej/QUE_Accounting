const router = require("express").Router();
const controller = require("../controller/invoice.controller");
const auth = require("../middleware/auth");
const checkPermission = require("../middleware/checkInvoicePermission");

/* ===============================
   CREATE INVOICE
================================ */
router.post(
  "/",
  auth,
  checkPermission("create"),
  controller.createInvoice
);

/* ===============================
   GET ALL INVOICES
================================ */
router.get(
  "/",
  auth,
  checkPermission("view"),
  controller.getAllInvoices
);

/* ===============================
   GET SINGLE INVOICE
================================ */
router.get(
  "/:id",
  auth,
  checkPermission("view"),
  controller.getInvoiceById
);

/* ===============================
   UPDATE STATUS
================================ */
router.patch(
  "/:id/status",
  auth,
  checkPermission("update"),
  controller.updateInvoiceStatus
);

/* ===============================
   DELETE INVOICE
================================ */
router.delete(
  "/:id",
  auth,
  checkPermission("delete"),
  controller.deleteInvoice
);

module.exports = router;
