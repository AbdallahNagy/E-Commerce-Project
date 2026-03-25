import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description: string;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

const Category = mongoose.model<ICategory>('Category', categorySchema);
export default Category;
