const express = require('express');
const { authMiddleware } = require('../../middlewares/authMiddleware');
const {
  getRecommendedCalories,
  addConsumedProduct,
  deleteConsumedProductForUser,
  getConsumedInfoForSpecificDay,
} = require('../../controllers/privateControllers');

const router = express.Router();

router.post('/private/recommendations', authMiddleware, getRecommendedCalories);

router.post('/private/add', authMiddleware, addConsumedProduct);
router.delete('/private/delete', authMiddleware, deleteConsumedProductForUser);
router.get(
  '/private/consumed/:date',
  authMiddleware,
  getConsumedInfoForSpecificDay
);

module.exports = router;
