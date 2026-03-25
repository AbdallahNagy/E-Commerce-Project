import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: Types.ObjectId;
  stock: number;
  images: string[];
  averageRating: number;
  numReviews: number;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: [{ type: String }],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;
