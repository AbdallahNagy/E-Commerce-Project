import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import ApiError from '../utils/ApiError';

// POST /api/orders  — create order from cart
export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { shippingAddress } = req.body;

    const cart = await Cart.findOne({ user: req.user!._id }).populate<{
      items: Array<{ product: InstanceType<typeof Product>; quantity: number; price: number }>;
    }>('items.product');

    if (!cart || cart.items.length === 0) {
      return next(new ApiError('Cart is empty.', 400));
    }

    // Validate stock and build order items
    const orderItems = [];
    for (const item of cart.items) {
      const product = item.product as any;
      if (product.stock < item.quantity) {
        return next(new ApiError(`Insufficient stock for "${product.name}".`, 400));
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: item.price,
      });
    }

    const totalPrice = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      user: req.user!._id,
      items: orderItems,
      shippingAddress,
      totalPrice,
    });

    // Decrement stock and clear cart concurrently
    await Promise.all([
      ...orderItems.map((i) =>
        Product.findByIdAndUpdate(i.product, { $inc: { stock: -i.quantity } })
      ),
      Cart.findOneAndDelete({ user: req.user!._id }),
    ]);

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders
export const getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filter = req.user!.role === 'admin' ? {} : { user: req.user!._id };
    const orders = await Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
export const getOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return next(new ApiError('Order not found.', 404));

    const isOwner = String(order.user._id) === String(req.user!._id);
    if (!isOwner && req.user!.role !== 'admin') {
      return next(new ApiError('Not authorized to view this order.', 403));
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id/status  — admin
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { ...(orderStatus && { orderStatus }), ...(paymentStatus && { paymentStatus }) },
      { new: true, runValidators: true }
    );
    if (!order) return next(new ApiError('Order not found.', 404));
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id/cancel
export const cancelOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new ApiError('Order not found.', 404));

    const isOwner = String(order.user) === String(req.user!._id);
    if (!isOwner) return next(new ApiError('Not authorized.', 403));
    if (order.orderStatus !== 'processing') {
      return next(new ApiError('Only orders in processing status can be cancelled.', 400));
    }

    order.orderStatus = 'cancelled';
    await order.save();

    // Restore stock
    await Promise.all(
      order.items.map((i) => Product.findByIdAndUpdate(i.product, { $inc: { stock: i.quantity } }))
    );

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};
