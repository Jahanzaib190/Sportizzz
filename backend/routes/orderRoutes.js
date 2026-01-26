const express = require('express');
const router = express.Router();
const { 
  addOrderItems, 
  getOrderById, 
  getMyOrders, 
  updateOrderToPaid,
  updateOrderToDelivered,
  getDashboardStats,
  getOrders,
  getOrderStats,
  updateOrderStatus // ✅ 1. IMPORT NEW CONTROLLER
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);

router.route('/myorders').get(protect, getMyOrders);

router.route('/stats').get(protect, admin, getDashboardStats);
router.route('/stats/summary').get(protect, admin, getOrderStats);

router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

// ✅ 2. NEW ROUTE FOR STATUS UPDATE
router.route('/:id/status').put(protect, admin, updateOrderStatus);

module.exports = router;