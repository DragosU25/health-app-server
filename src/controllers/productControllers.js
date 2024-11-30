const healthService = require('../services/healthServices');
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require('../utils/responseHelper');

const getAllProducts = async (req, res, next) => {
  try {
    const products = await healthService.getAllHealthProducts();
    sendSuccessResponse(res, products);
  } catch (error) {
    sendErrorResponse(res, error);
    next(error);
  }
};

const getRecommendedCalories = async (req, res, next) => {
  const { height, desiredWeight, age, bloodGroupIndex, currentWeight } =
    req.body;

  if (
    typeof height !== 'number' ||
    typeof desiredWeight !== 'number' ||
    typeof age !== 'number' ||
    typeof bloodGroupIndex !== 'number' ||
    typeof currentWeight !== 'number'
  ) {
    return sendErrorResponse(res, new Error('Invalid input data'), 400);
  }

  const recommendedDailyCaloriesIntake =
    healthService.calculateRecommendedCalories(
      height,
      desiredWeight,
      age,
      currentWeight
    );

  try {
    if (isNaN(bloodGroupIndex) || bloodGroupIndex < 1) {
      return sendErrorResponse(
        res,
        new Error('Invalid blood group index'),
        400
      );
    }

    const result =
      await healthService.getCategoriesForBloodGroup(bloodGroupIndex);

    const restrictedAlimentsData = result.map((product) => ({
      categories: product.categories,
      title: product.title,
      calories: product.calories,
      weight: product.weight,
    }));

    sendSuccessResponse(res, {
      restrictedAliments: restrictedAlimentsData,
      recommendedDailyCaloriesIntake,
    });
  } catch (error) {
    sendErrorResponse(res, error, 500);
    next(error);
  }
};

const getSearchedProduct = async (req, res, next) => {
  const { name } = req.params;
  console.log(name);

  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ status: 'error', message: 'Invalid name' });
  }

  try {
    const products = await healthService.getCategoryByName(name);
    console.log('products', products);
    return res.status(200).json({ status: 'success', data: products });
  } catch (error) {
    return res.status(404).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  getAllProducts,
  getRecommendedCalories,
  getSearchedProduct,
};
