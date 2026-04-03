import express from 'express';
import { addCustomer, updateCustomer} from '../controllers/customerController.js';
import verifyToken from '../middleware/authmiddleware.js';
import authorizeRoles from '../middleware/rolemiddleware.js';

const router = express.Router();

router.post('/addcustomer', verifyToken, authorizeRoles('admin'), addCustomer);
router.put('/updatecustomer/:id', verifyToken, authorizeRoles('admin'), updateCustomer);

export default router;
