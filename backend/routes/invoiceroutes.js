import express from "express";
import { createInvoice, getInvoices} from "../controllers/invoiceController.js";
import authorizeRoles from "../middleware/rolemiddleware.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/createInvoice", verifyToken, authorizeRoles("admin"), createInvoice);
router.get("/getInvoices", verifyToken, authorizeRoles("admin"), getInvoices);

export default router;
