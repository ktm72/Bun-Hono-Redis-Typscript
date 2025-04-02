import { Hono } from 'hono';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController';
import { validate } from '../middlewares/validate';
import { UserCreateSchema } from '../entities/userEntity';

const router = new Hono();

router.post('/', validate(UserCreateSchema), createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
