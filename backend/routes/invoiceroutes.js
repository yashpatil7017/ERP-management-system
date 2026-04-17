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
router.get("/", verifyToken, authorizeRoles("admin"), getInvoices);
router.post("/", verifyToken, authorizeRoles("admin"), createInvoice);

// Legacy endpoints kept for compatibility
router.post("/createInvoice", verifyToken, authorizeRoles("admin"), createInvoice);
router.get("/getInvoices", verifyToken, authorizeRoles("admin"), getInvoices);
router.get("/getInvoiceById/:id", verifyToken, authorizeRoles("admin"), getInvoiceById);
router.put("/updateInvoiceStatus/:id", verifyToken, authorizeRoles("admin"), updateInvoiceStatus);
router.get("/getRevenueReport", verifyToken, authorizeRoles("admin"), getRevenueReport);

router.get("/:id", verifyToken, authorizeRoles("admin"), getInvoiceById);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteInvoice);

export default router;
