import { Hono } from 'hono';
import { checkDatabaseStorage } from '../controllers/storageController';
const router = new Hono();

router.get('/', checkDatabaseStorage);

export default router;
