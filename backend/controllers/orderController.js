const asyncHandler = require('../middleware/asyncHandler');
const Order = require('../models/orderModel');
const User = require('../models/userModel'); // Used for Dashboard Stats
const Product = require('../models/productModel');
const sendEmail = require('../utils/sendEmail'); // ✅ Changed: Now using unified sendEmail

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = req.body.status;

    // ✅ CASE 1: Delivered (Auto Paid & Delivered)
    if (req.body.status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      
      // Agar abhi tak paid nahi hai, to delivered par paid b mark kar do (COD Logic)
      if (!order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
      }
    } 
    // ✅ CASE 2: Cancelled (Reset Everything)
    else if (req.body.status === 'Cancelled') {
      order.isPaid = false;
      order.paidAt = null;
      order.isDelivered = false;
      order.deliveredAt = null;
    }
    // ✅ CASE 3: Shipped (Just update status, keep payment as is)
    else if (req.body.status === 'Shipped') {
        order.isDelivered = false;
        order.deliveredAt = null;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    const mappedItems = orderItems.map((x) => ({
      ...x,
      // ✅ FIXED: Extract real productId from unique ID (format: productId-Color-Size)
      product: x.productId || x._id?.split('-')[0] || x._id,
      _id: undefined,
    }));

    // ✅ Validate stock before creating order
    for (const item of mappedItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error('Product not found');
      }
      if (product.countInStock < item.qty) {
        res.status(400);
        throw new Error(`Insufficient stock for ${product.name}`);
      }
    }

    const order = new Order({
      orderItems: mappedItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      stockReduced: false,
    });

    const createdOrder = await order.save();

    // ✅ Decrease stock immediately for all orders
    for (const item of createdOrder.orderItems) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      product.countInStock -= item.qty;
      if (product.countInStock < 0) product.countInStock = 0;
      await product.save();
    }

    createdOrder.stockReduced = true;
    await createdOrder.save();

    // ✅ FIXED: Email Sending Logic
    try {
        // req.user Protected Middleware se aata hai, isliye email aur name available honge
        if (req.user && req.user.email) {
            await sendEmail({
              email: req.user.email,
              subject: 'Order Confirmation - SPORTIZZZ',
              message: `Your order has been confirmed!`,
              type: 'order', // ✅ Specify type
              order: createdOrder,
              name: req.user.name,
            });
        }
    } catch (error) {
        console.error("Order created but email failed:", error);
    }

    res.status(201).json(createdOrder);
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    // --- Decrease stock for every item in the order (only once) ---
    if (!order.stockReduced) {
      for (const index in order.orderItems) {
        const item = order.orderItems[index];
        const product = await Product.findById(item.product);
        
        if (product) {
          product.countInStock = product.countInStock - item.qty;
          if (product.countInStock < 0) {
              product.countInStock = 0;
          }
          await product.save();
        }
      }
      order.stockReduced = true;
    }
    // ------------------------------------------------

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

// @desc    Get Admin Dashboard Stats (Legacy/Graph Data)
// @route   GET /api/orders/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const ordersCount = await Order.countDocuments();
  const usersCount = await User.countDocuments();

  const totalSalesResult = await Order.aggregate([
    { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } },
  ]);
  const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].totalSales : 0;

  const salesData = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalSales: { $sum: '$totalPrice' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({ usersCount, ordersCount, totalSales, salesData });
});

// ------------------------------------------------------------------
// ✅ NEW FUNCTION: Get Detailed Order Stats for Finance Dashboard
// @route   GET /api/orders/stats/summary
// ------------------------------------------------------------------
const getOrderStats = asyncHandler(async (req, res) => {
  const stats = await Order.aggregate([
    {
      $group: {
        // Group by Date (YYYY-MM-DD)
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        // Sum total price for revenue
        totalSales: { $sum: "$totalPrice" },
        // Count number of orders
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } }, // Newest first
  ]);

  // Format data for frontend table
  const dailyStats = stats.map((item) => ({
    _id: item._id,
    dailySales: item.totalSales,
    count: item.count,
  }));

  res.status(200).json({
    success: true,
    data: dailyStats,
  });
});

module.exports = {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
  getDashboardStats, 
  getOrderStats,
  updateOrderStatus, // <--- ✅ ADDED THIS EXPORT
};