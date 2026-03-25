import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
}

export interface IShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface IOrder extends Document {
  user: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  totalPrice: number;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    orderStatus: {
      type: String,
      enum: ['processing', 'shipped', 'delivered', 'cancelled'],
      default: 'processing',
    },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;
