import express from 'express';
import verifyToken from '../middleware/authmiddleware.js';
import { getDashboardStats, getDashboardSales } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/', verifyToken, getDashboardStats);
router.get('/sales', verifyToken, getDashboardSales);

export default router;
