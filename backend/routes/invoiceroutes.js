import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  deleteInvoice,
  updateInvoiceStatus,
  getRevenueReport,
} from "../controllers/invoiceController.js";
import authorizeRoles from "../middleware/rolemiddleware.js";
import verifyToken from "../middleware/authmiddleware.js";

const router = express.Router();

// REST-style endpoints requested by frontend
router.get("/", verifyToken, getInvoices);
router.post("/", verifyToken, authorizeRoles('admin','sales'), createInvoice);

// Legacy endpoints kept for compatibility
router.post("/createInvoice", verifyToken, authorizeRoles('admin','sales'), createInvoice);
router.get("/getInvoices", verifyToken, getInvoices);
router.get("/getInvoiceById/:id", verifyToken, getInvoiceById);
router.put("/updateInvoiceStatus/:id", verifyToken, authorizeRoles('admin','sales'), updateInvoiceStatus);
router.get("/getRevenueReport", verifyToken, getRevenueReport);

router.get("/:id", verifyToken, getInvoiceById);
router.delete("/:id", verifyToken, authorizeRoles('admin','sales'), deleteInvoice);

export default router;
