import { Router } from 'express';
import { getUsers, getUser, updateUser, deleteUser } from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect, authorize('admin'));

router.route('/').get(getUsers);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

export default router;
