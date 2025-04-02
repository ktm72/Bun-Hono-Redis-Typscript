import { type Context } from 'hono';
import User from '../services/userServices';
import { setCache, getCache, deleteCache } from '../services/redisService';
import { withErrorHandling } from '../middlewares/errorMiddleware';

export const createUser = withErrorHandling(async (c: Context) => {
  const data = await c.req.json();
  const user = await User.createUser(data);
  return c.json({ result: user, message: 'user created successfully!' }, 201);
}, 400);

export const getAllUsers = withErrorHandling(async (c: Context) => {
  const users = await User.findAllUsers();
  return c.json({ result: users, message: 'users retrived successfully!' });
}, 500);

export const getUserById = withErrorHandling(async (c: Context) => {
  const id = c.req.param('id');
  const cachedUser = await getCache(id);
  if (!cachedUser) {
    const user = await User.findUserById(id);
    await setCache(id, user, 60 * 30);
    return c.json({ result: user, message: 'user retrived successfully!' });
  } else {
    return c.json({
      result: cachedUser,
      message: 'user retrived successfully!'
    });
  }
}, 400);

export const updateUser = withErrorHandling(async (c: Context) => {
  const id = c.req.param('id');
  const data = await c.req.json();
  const user = await User.updateUser(id, data);
  await deleteCache(id);
  return c.json({ result: user, message: 'user updated successfully!' });
}, 404);

export const deleteUser = withErrorHandling(async (c: Context) => {
  const id = c.req.param('id');
  await User.deleteUser(id);
  await deleteCache(id);
  return c.json({ result: id, message: 'User deleted successfully' });
}, 400);
