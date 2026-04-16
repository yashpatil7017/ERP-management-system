import express from "express";
import { createGRN, getGRNs } from "../controllers/grnController.js";
import verifyToken from "../middleware/authmiddleware.js";
import authorizeRoles from "../middleware/rolemiddleware.js";

const router = express.Router();

router.post("/createGRN", verifyToken, authorizeRoles("admin"), createGRN);
router.get("/getGRNs", verifyToken, authorizeRoles("admin"), getGRNs);

export default router;
