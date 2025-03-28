import { type Context } from 'hono';
import User from '../services/userServices';
import { setCache, getCache, deleteCache } from '../services/redisService';

export async function createUser(c: Context) {
  const data = await c.req.json();
  try {
    const user = await User.createUser(data);
    return c.json(user, 201);
  } catch (error) {
    return c.json({ error }, 400);
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
      if (!user) {
        return c.json({ message: 'User not found' }, 404);
      }
      await setCache(id, user, 30);
      return c.json(user);
    } else {
      return c.json(cachedUser);
    }
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Invalid user ID' }, 400);
  }
}

export async function updateUser(c: Context) {
  const id = c.req.param('id');
  const data = await c.req.json();
  try {
    const user = await User.updateUser(id, data);
    if (user) {
      await deleteCache(id);
    }
    return c.json(user);
  } catch (error) {
    return c.json({ error }, 400);
  }
}

export async function deleteUser(c: Context) {
  const id = c.req.param('id');
  try {
    await User.deleteUser(id);
    await deleteCache(id);
    return c.json({ message: 'User deleted successfully' });
  } catch (error) {
    return c.json({ error }, 400);
  }
}
