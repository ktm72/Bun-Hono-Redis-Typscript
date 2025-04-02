import { getUserModel } from '../models/userModel';
import { type User, type UserResponse } from '../entities/userEntity';
import { NotFoundError } from '../utils/error-handler';

async function createUser(user: User): Promise<UserResponse> {
  const model = getUserModel(user.username);
  const newUser = await model.create(user);
  return toDomainEntity(newUser);
}

async function findAllUsers(
  page: number = 1,
  limit: number = 2,
  sortField: string = 'username',
  sortOrder: 'asc' | 'desc' = 'asc'
) {
  const modelAN = getUserModel('a');
  const modelMZ = getUserModel('n');
  // Get total counts first
  const [countAN, countMZ] = await Promise.all([
    modelAN.countDocuments(),
    modelMZ.countDocuments()
  ]);

  const totalUsers = countAN + countMZ;
  const totalPages = Math.ceil(totalUsers / limit);
  const skip = (page - 1) * limit;

  // Determine which partition(s) contain the requested page
  if (skip + limit <= countAN) {
    // Entire page is in A-M partition
    const users = await modelAN
      .find()
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      users: users.map(toDomainEntity),
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        usersPerPage: limit
      }
    };
  } else if (skip >= countAN) {
    // Entire page is in N-Z partition
    const adjustedSkip = skip - countAN;
    const users = await modelMZ
      .find()
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip(adjustedSkip)
      .limit(limit)
      .lean();

    return {
      users: users.map(toDomainEntity),
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        usersPerPage: limit
      }
    };
  } else {
    // Page spans both partitions
    const remainingInAN = countAN - skip;
    const neededFromMZ = limit - remainingInAN;

    const [usersAN, usersMZ] = await Promise.all([
      modelAN
        .find()
        .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(remainingInAN)
        .lean(),
      modelMZ
        .find()
        .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
        .skip(0)
        .limit(neededFromMZ)
        .lean()
    ]);

    const combinedUsers = [...usersAN, ...usersMZ];

    return {
      users: combinedUsers.map(toDomainEntity),
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        usersPerPage: limit
      }
    };
  }
}

async function findUserById(id: string, username: string) {
  if (!id || !username) {
    throw new Error('Query or Param is missing!');
  }
  const model = getUserModel(username);
  const user = await model.findById(id).lean();

  // Since we don't know which collection the user is in, we need to check both
  // const modelAN = getUserModel('a');
  // const modelMZ = getUserModel('n');
  // const [userAN, userMZ] = await Promise.all([
  //   modelAN.findById(id).lean(),
  //   modelMZ.findById(id).lean()
  // ]);

  // const user = userAN || userMZ;
  if (!user) throw new NotFoundError('User not found');
  return toDomainEntity(user);
}

async function updateUser(id: string, username: string, user: Partial<User>) {
  if (!id || !username) {
    throw new Error('Query or Param is missing!');
  }
  // First find the user to know which collection they're in
  const existingUser = await findUserById(id, username);
  if (!existingUser) throw new NotFoundError('User not found');

  const model = getUserModel(existingUser.username);
  const updatedUser = await model
    .findByIdAndUpdate(
      id,
      { ...user, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    .lean();

  if (!updatedUser) throw new Error('User was not updated');
  return toDomainEntity(updatedUser);
}

async function deleteUser(id: string, username: string) {
  if (!id || !username) {
    throw new Error('Query or Param is missing!');
  }
  // First find the user to know which collection they're in
  const existingUser = await findUserById(id, username);
  if (!existingUser) throw new NotFoundError('User not found');

  const model = getUserModel(existingUser.username);
  const result = await model.deleteOne({ _id: id });
  if (result.deletedCount === 0) {
    throw new Error('User not found');
  }
}

// factory function
const toDomainEntity = (mongooseUser: any): UserResponse => ({
  id: mongooseUser._id.toString(),
  username: mongooseUser.username,
  email: mongooseUser.email,
  password: mongooseUser.password,
  firstName: mongooseUser.firstName,
  lastName: mongooseUser.lastName,
  createdAt: mongooseUser.createdAt,
  updatedAt: mongooseUser.updatedAt
});

export default {
  updateUser,
  createUser,
  deleteUser,
  findAllUsers,
  findUserById
};
