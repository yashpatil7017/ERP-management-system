import express from 'express';
import { createSalesOrder, updateSalesOrder} from '../controllers/salesOrderController.js';
import verifyToken from '../middleware/authmiddleware.js';
import authorizeRoles from '../middleware/rolemiddleware.js';

const router = express.Router();

router.post('/createSalesOrder', verifyToken, authorizeRoles('admin'), createSalesOrder);
router.put('/updateSalesOrder/:id', verifyToken, authorizeRoles('admin'), updateSalesOrder);

export default router;
