import { Schema, model, Document, Model } from 'mongoose';

interface IUserDocument extends Document {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    match: [/^[A-Za-z]/, 'Username must start with a letter']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/.+\@.+\..+/, 'Please use a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Function to determine collection name based on username
function getUserCollectionName(username: string): string {
  const firstChar = username.toLowerCase().charCodeAt(0);
  return firstChar >= 'a'.charCodeAt(0) && firstChar <= 'm'.charCodeAt(0)
    ? 'users_a_m'
    : 'users_n_z';
}

// Create a dynamic model that selects collection based on username
// Helper function to get the correct model for a username
export function getUserModel(username: string): Model<IUserDocument> {
  const collectionName = getUserCollectionName(username);
  return model<IUserDocument>('User', userSchema, collectionName);
}
