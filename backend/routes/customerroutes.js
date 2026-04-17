import express from 'express';
import { addCustomer, updateCustomer, deleteCustomer, getCustomers} from '../controllers/customerController.js';
import authorizeRoles from '../middleware/rolemiddleware.js';
import verifyToken from '../middleware/authmiddleware.js';

const router = express.Router();

router.post('/addcustomer', verifyToken, authorizeRoles('admin','sales'), addCustomer);
router.put('/updatecustomer/:id', verifyToken, authorizeRoles('admin','sales'), updateCustomer);
router.delete('/deletecustomer/:id', verifyToken, authorizeRoles('admin','sales'), deleteCustomer);
router.get('/getcustomers', verifyToken, getCustomers);
export default router;
