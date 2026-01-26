const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  deleteCategory,
  getCategoryById,
  updateCategory,
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, admin, createCategory)
  .get(getCategories);

router.route('/:id')
  .delete(protect, admin, deleteCategory)
  .put(protect, admin, updateCategory)
  .get(getCategoryById);

module.exports = router;