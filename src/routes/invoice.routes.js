const router = require("express").Router();
const controller = require("../controller/invoice.controller");
const checkPermission = require("../middleware/checkInvoicePermission");
router.post("/", controller.createInvoice);
router.get("/", controller.getAllInvoices);
router.get("/:id", controller.getInvoiceById);
router.delete("/:id", controller.deleteInvoice);
router.patch("/:id/status", controller.updateInvoiceStatus);
router.get("/:id/pdf", controller.downloadInvoicePDF);


router.post("/", checkPermission("create"), controller.createInvoice);
router.get("/", checkPermission("view"), controller.getAllInvoices);
router.get("/:id", checkPermission("view"), controller.getInvoiceById);
router.delete("/:id", checkPermission("delete"), controller.deleteInvoice);
router.patch("/:id/status", checkPermission("update"), controller.updateInvoiceStatus);
router.get("/:id/pdf", checkPermission("view"), controller.downloadInvoicePDF);

module.exports = router;
