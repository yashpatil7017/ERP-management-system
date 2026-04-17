import express from "express";
import { createGRN, getGRNs } from "../controllers/grnController.js";
import verifyToken from "../middleware/authmiddleware.js";
import authorizeRoles from "../middleware/rolemiddleware.js";

const router = express.Router();

router.post("/createGRN", verifyToken, authorizeRoles('admin','inventory','purchase'), createGRN);
router.get("/getGRNs", verifyToken, getGRNs);

export default router;
