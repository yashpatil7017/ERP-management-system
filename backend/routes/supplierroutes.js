import express from "express";
import { addSupplier, updateSupplier, deleteSupplier, getSuppliers } from "../controllers/supplierController.js";
import verifyToken from "../middleware/authmiddleware.js";
import authorizeRoles from "../middleware/rolemiddleware.js";

const router = express.Router();

router.post("/addSupplier", verifyToken, authorizeRoles("admin"), addSupplier);
router.put("/updateSupplier/:id", verifyToken, authorizeRoles("admin"), updateSupplier);
router.delete("/deleteSupplier/:id", verifyToken, authorizeRoles("admin"), deleteSupplier);
router.get("/getSuppliers", verifyToken, authorizeRoles("admin"), getSuppliers);

export default router;
