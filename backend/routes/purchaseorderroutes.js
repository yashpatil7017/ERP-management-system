import express from 'express';
import { createPurchaseOrder, getPurchaseOrders, updatePurchaseOrderStatus } from '../controllers/purchaseOrderController.js';
import verifyToken from '../middleware/authmiddleware.js';
import authorizeRoles from '../middleware/rolemiddleware.js';

const router = express.Router();

router.post('/createPurchaseOrder', verifyToken, authorizeRoles('admin','purchase'), createPurchaseOrder);
router.get('/getPurchaseOrders', verifyToken, getPurchaseOrders);
router.put('/updatePurchaseOrderStatus/:id', verifyToken, authorizeRoles('admin','purchase'), updatePurchaseOrderStatus);

export default router;
