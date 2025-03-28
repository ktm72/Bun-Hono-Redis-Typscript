import { UserModel } from '../models/userModel';
import { type User, type UserResponse } from '../entities/userEntity';

async function createUser(user: User): Promise<UserResponse> {
  const newUser = await UserModel.create(user);
  return toDomainEntity(newUser);
}

async function findAllUsers() {
  const users = await UserModel.find().lean();
  return users.map(toDomainEntity);
}

async function findUserById(id: string) {
  const user = await UserModel.findById(id).lean();
  return user ? toDomainEntity(user) : null;
}

async function updateUser(id: string, user: Partial<User>) {
  const updatedUser = await UserModel.findByIdAndUpdate(
    id,
    { ...user, updatedAt: new Date() },
    { new: true, runValidators: true }
  ).lean();

  if (!updatedUser) throw new Error('User not found');
  return toDomainEntity(updatedUser);
}

async function deleteUser(id: string) {
  const result = await UserModel.deleteOne({ _id: id });
  if (result.deletedCount === 0) {
    throw new Error('User not found');
  }
}

function toDomainEntity(mongooseUser: any): UserResponse {
  return {
    id: mongooseUser._id.toString(),
    username: mongooseUser.username,
    email: mongooseUser.email,
    password: mongooseUser.password,
    firstName: mongooseUser.firstName,
    lastName: mongooseUser.lastName,
    createdAt: mongooseUser.createdAt,
    updatedAt: mongooseUser.updatedAt
  };
}

export default {
  updateUser,
  createUser,
  deleteUser,
  findAllUsers,
  findUserById
};
