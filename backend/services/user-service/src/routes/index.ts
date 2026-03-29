import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getDashboardStats,
  searchUsers,
} from '../controllers/user.controller.js';

const router = Router();

// Authenticated user routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

// Search (authenticated)
router.get('/search', authenticate, searchUsers);

// Admin-only routes
router.get('/stats', authenticate, authorize('admin'), getDashboardStats);
router.get('/', authenticate, authorize('admin'), getAllUsers);
router.get('/:id', authenticate, authorize('admin'), getUserById);
router.put('/:id/role', authenticate, authorize('admin'), updateUserRole);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

export default router;
