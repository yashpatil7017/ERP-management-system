import express from 'express';
import verifyToken from '../middleware/authmiddleware.js';
import authorizeRoles from '../middleware/rolemiddleware.js';
import { getAllUsers, createUser, updateUser, updateUserStatus } from '../controllers/userController.js';

const router = express.Router();

// Admin user management APIs
router.get('/', verifyToken, authorizeRoles('admin'), getAllUsers);
router.post('/', verifyToken, authorizeRoles('admin'), createUser);
router.put('/:id', verifyToken, authorizeRoles('admin'), updateUser);
router.patch('/:id/status', verifyToken, authorizeRoles('admin'), updateUserStatus);

export default router;
