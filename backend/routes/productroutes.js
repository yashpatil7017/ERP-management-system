import express from 'express';
import { createProduct, deleteProduct, updateProduct, getProducts} from '../controllers/productController.js';
import { getTopSellingProducts, getLowStockProducts } from '../controllers/dashboardController.js';
import verifyToken from '../middleware/authmiddleware.js';
import authorizeRoles from '../middleware/rolemiddleware.js';

const router = express.Router();

router.post('/add', verifyToken, authorizeRoles('admin','inventory'), createProduct);
router.delete('/delete/:id', verifyToken, authorizeRoles('admin','inventory'), deleteProduct);
router.put('/update/:id', verifyToken, authorizeRoles('admin','inventory'), updateProduct);
router.get('/getproducts', verifyToken, getProducts);

router.get('/top-selling', verifyToken, getTopSellingProducts);
router.get('/low-stock', verifyToken, getLowStockProducts);

export default router;

