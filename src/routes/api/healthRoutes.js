// routes/healthRoutes.js
const express = require('express');
const router = express.Router();

const {
  getAllProducts,
  getRecommendedCalories,
  getSearchedProduct,
} = require('../../controllers/productControllers');

// GET /api/health/products - Retrieve all health products
router.get('/products', getAllProducts);

// POST /api/health/recommendations - Get recommended calories and restricted aliments
router.post('/products/recommendations', getRecommendedCalories);

// GET /api/health/products/:name - Get product by name
router.get('/products/search/:name', getSearchedProduct);

module.exports = router;
