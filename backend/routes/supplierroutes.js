import express from "express";
import { addSupplier, updateSupplier, deleteSupplier, getSuppliers } from "../controllers/supplierController.js";
import verifyToken from "../middleware/authmiddleware.js";
import authorizeRoles from "../middleware/rolemiddleware.js";

const router = express.Router();

router.post("/addSupplier", verifyToken, authorizeRoles("admin","purchase"), addSupplier);
router.put("/updateSupplier/:id", verifyToken, authorizeRoles("admin","purchase"), updateSupplier);
router.delete("/deleteSupplier/:id", verifyToken, authorizeRoles("admin","purchase"), deleteSupplier);
router.get("/getSuppliers", verifyToken, getSuppliers);

export default router;
