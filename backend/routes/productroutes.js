import express from 'express';
import { createProduct, deleteProduct, updateProduct, getProducts} from '../controllers/productController.js';
import verifyToken from '../middleware/authmiddleware.js';
import authorizeRoles from '../middleware/rolemiddleware.js';

const router = express.Router();

router.post('/add', verifyToken, authorizeRoles('admin'), createProduct);
router.delete('/delete/:id', verifyToken, authorizeRoles('admin'), deleteProduct);
router.put('/update/:id', verifyToken, authorizeRoles('admin'), updateProduct);
router.get('/getproducts', verifyToken, authorizeRoles('admin'), getProducts);

export default router;

