import express from 'express';
import { createSalesOrder, updateSalesOrder, getSalesOrder, updateOrderStatus} from '../controllers/salesOrderController.js';
import { getRecentSalesOrders } from '../controllers/dashboardController.js';
import verifyToken from '../middleware/authmiddleware.js';
import authorizeRoles from '../middleware/rolemiddleware.js';

const router = express.Router();

router.post('/createSalesOrder', verifyToken, authorizeRoles('admin','sales'), createSalesOrder);
router.put('/updateSalesOrder/:id', verifyToken, authorizeRoles('admin','sales'), updateSalesOrder);
router.get('/getSalesOrder', verifyToken, getSalesOrder);
router.put('/updateOrderStatus/:id', verifyToken, authorizeRoles('admin','sales'), updateOrderStatus);

router.get('/recent', verifyToken, getRecentSalesOrders);

export default router;
