import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  address: IAddress;
  comparePassword(candidate: string): Promise<boolean>;
}

const addressSchema = new Schema<IAddress>(
  {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    address: { type: addressSchema, default: {} },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;
