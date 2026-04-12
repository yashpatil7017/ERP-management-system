import express from "express";
import { createGRN, getGRNs } from "../controllers/grnController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/createGRN", authMiddleware, verifyToken, createGRN);
router.get("/getGRNs", authMiddleware, verifyToken, getGRNs);

export default router;
