import { type Context } from 'hono';
import User from '../services/userServices';
import { setCache, getCache, deleteCache } from '../services/redisService';
import { withErrorHandling } from '../utils/error-handler';
import { isSortOrder } from '../types';

export const createUser = withErrorHandling(async (c: Context) => {
  const data = c.get('validatedData');
  const user = await User.createUser(data);
  return c.json({ result: user, message: 'user created successfully!' }, 201);
}, 400);

export const getAllUsers = withErrorHandling(async (c: Context) => {
  const page: number = parseInt(c.req.query('page') || '1', 10);
  const limit: number = parseInt(c.req.query('limit') || '2', 10);
  const sortField: string = c.req.query('sort-field') || 'username';
  const orderQuery = c.req.query('order') || 'asc';
  const sortOrder = isSortOrder(orderQuery) ? orderQuery : 'asc';
  const users = await User.findAllUsers(page, limit, sortField, sortOrder);
  return c.json({ result: users, message: 'users retrived successfully!' });
}, 500);

export const getUserById = withErrorHandling(async (c: Context) => {
  const id = c.req.param('id');
  const username = c.req.query('username')!;
  const cachedUser = await getCache(id);
  if (!cachedUser) {
    const user = await User.findUserById(id, username);
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
  const username = c.req.query('username')!;
  const data = await c.req.json();
  const user = await User.updateUser(id, username, data);
  await deleteCache(id);
  return c.json({ result: user, message: 'user updated successfully!' });
}, 404);

export const deleteUser = withErrorHandling(async (c: Context) => {
  const id = c.req.param('id');
  const username = c.req.query('username')!;
  await User.deleteUser(id, username);
  await deleteCache(id);
  return c.json({ result: id, message: 'User deleted successfully' });
}, 400);
