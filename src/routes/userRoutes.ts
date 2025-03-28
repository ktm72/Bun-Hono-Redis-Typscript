import { Hono } from 'hono';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController';

const router = new Hono();

router.post('/', createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
