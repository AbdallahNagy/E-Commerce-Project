import mongoose, { Document, Schema, Types } from 'mongoose';
import Product from './Product';

export interface IReview extends Document {
  user: Types.ObjectId;
  product: Types.ObjectId;
  rating: number;
  comment: string;
}

const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// One review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

async function recalculateRating(productId: Types.ObjectId): Promise<void> {
  const result = await mongoose.model('Review').aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(result[0].avgRating * 10) / 10,
      numReviews: result[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { averageRating: 0, numReviews: 0 });
  }
}

reviewSchema.post('save', async function () {
  await recalculateRating(this.product);
});

reviewSchema.post('findOneAndDelete', async function (doc: IReview | null) {
  if (doc) await recalculateRating(doc.product);
});

const Review = mongoose.model<IReview>('Review', reviewSchema);
export default Review;
