const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts, // <--- This MUST be exported from the controller
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// 1. Root Route: Fetch all products or Create new one
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

// 2. Top Products Route
// CRITICAL: This must be defined BEFORE the /:id route.
router.get('/top', getTopProducts);

// 3. Reviews Route
router.route('/:id/reviews')
  .post(protect, createProductReview);

// 4. ID Route: Fetch, Update, or Delete single product
// CRITICAL: This acts as a "catch-all" for IDs, so it must be LAST.
router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;