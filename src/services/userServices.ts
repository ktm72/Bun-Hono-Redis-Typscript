import { getUserModel } from '../models/userModel';
import { type User, type UserResponse } from '../entities/userEntity';

async function createUser(user: User): Promise<UserResponse> {
  const model = getUserModel(user.username);
  const newUser = await model.create(user);
  return toDomainEntity(newUser);
}

async function findAllUsers() {
  // Need to query both collections
  const modelAN = getUserModel('a'); // use 'a' to get the A-M model
  const modelMZ = getUserModel('n'); // use 'm' to get the N-Z model

  const [usersAN, usersMZ] = await Promise.all([
    modelAN.find().lean(),
    modelMZ.find().lean()
  ]);

  return [...usersAN, ...usersMZ].map(toDomainEntity);
}

async function findUserById(id: string) {
  // Since we don't know which collection the user is in, we need to check both
  const modelAN = getUserModel('a');
  const modelMZ = getUserModel('n');

  const [userAN, userMZ] = await Promise.all([
    modelAN.findById(id).lean(),
    modelMZ.findById(id).lean()
  ]);

  const user = userAN || userMZ;
  if (!user) throw new Error('User not found');
  return toDomainEntity(user);
}

async function updateUser(id: string, user: Partial<User>) {
  // First find the user to know which collection they're in
  const existingUser = await findUserById(id);
  if (!existingUser) throw new Error('User not found');

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

async function deleteUser(id: string) {
  // First find the user to know which collection they're in
  const existingUser = await findUserById(id);
  if (!existingUser) throw new Error('User not found');

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
