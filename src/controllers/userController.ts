import { type Context } from 'hono';
import User from '../services/userServices';
import { setCache, getCache, deleteCache } from '../services/redisService';
import { errorHandler } from '../middlewares/errorMiddleware';

export async function createUser(c: Context) {
  const data = await c.req.json();
  try {
    const user = await User.createUser(data);
    return c.json(user, 201);
  } catch (error) {
    return errorHandler(error, c);
  }
}

export async function getAllUsers(c: Context) {
  const users = await User.findAllUsers();
  return c.json(users);
}

export async function getUserById(c: Context) {
  const id = c.req.param('id');
  try {
    const cachedUser = await getCache(id);
    if (!cachedUser) {
      const user = await User.findUserById(id);
      await setCache(id, user, 30);
      return c.json(user);
    } else {
      return c.json(cachedUser);
    }
  } catch (error) {
    return errorHandler(error, c, 400);
  }
}

export async function updateUser(c: Context) {
  const id = c.req.param('id');
  const data = await c.req.json();
  try {
    const user = await User.updateUser(id, data);
    await deleteCache(id);
    return c.json(user);
  } catch (error) {
    return errorHandler(error, c, 404);
  }
}

export async function deleteUser(c: Context) {
  const id = c.req.param('id');
  try {
    await User.deleteUser(id);
    await deleteCache(id);
    return c.json({ message: 'User deleted successfully' });
  } catch (error) {
    return errorHandler(error, c, 400);
  }
}
