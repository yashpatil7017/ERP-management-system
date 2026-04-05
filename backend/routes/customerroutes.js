import express from 'express';
import { addCustomer, updateCustomer, deleteCustomer, getCustomers} from '../controllers/customerController.js';
import verifyToken from '../middleware/authmiddleware.js';
import authorizeRoles from '../middleware/rolemiddleware.js';

const router = express.Router();

router.post('/addcustomer', verifyToken, authorizeRoles('admin'), addCustomer);
router.put('/updatecustomer/:id', verifyToken, authorizeRoles('admin'), updateCustomer);
router.delete('/deletecustomer/:id', verifyToken, authorizeRoles('admin'), deleteCustomer);
router.get('/getcustomers', verifyToken, authorizeRoles('admin'), getCustomers);
export default router;
