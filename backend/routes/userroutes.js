import express from 'express';
import verifyToken from '../middleware/authmiddleware.js';
import authorizeRoles from '../middleware/rolemiddleware.js';

const router = express.Router();

//Admin access only
router.get('/admin', verifyToken, authorizeRoles('admin'), (req, res) => {
    res.json({ message: 'Welcome to the admin' });
});

//Sales access only
router.get('/sales', verifyToken, authorizeRoles('admin','sales'), (req, res) => {
    res.json({ message: 'Welcome to the sales' });
});

//Purchase access only
router.get('/purchase', verifyToken, authorizeRoles('admin','purchase'), (req, res) => {
    res.json({ message: 'Welcome to the purchase' });
});

//Inventory access only
router.get('/inventory', verifyToken, authorizeRoles('admin', 'inventory'), (req, res) => {
    res.json({ message: 'Welcome to the inventory' });
});

export default router;
