import { Schema, model, Document } from 'mongoose';

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
    minlength: 3
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

// Update the updatedAt field before saving
// userSchema.pre<IUserDocument>('save', function(next) {
//   this.updatedAt = new Date();
//   next();
// });

export const UserModel = model<IUserDocument>('User', userSchema);
