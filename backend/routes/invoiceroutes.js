import express from "express";
import { createInvoice, getInvoices, getInvoiceById} from "../controllers/invoiceController.js";
import authorizeRoles from "../middleware/rolemiddleware.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/createInvoice", verifyToken, authorizeRoles("admin"), createInvoice);
router.get("/getInvoices", verifyToken, authorizeRoles("admin"), getInvoices);
router.get("/getInvoiceById/:id", verifyToken, authorizeRoles("admin"), getInvoiceById);

export default router;
