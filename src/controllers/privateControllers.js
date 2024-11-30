const {
  getCategoriesForBloodGroup,
  addConsumedProduct,
  deleteConsumedProduct,
  getConsumedInfoForDate,
} = require('../services/privateServices');
const healthService = require('../services/healthServices');
const User = require('../models/userSchema');

const { extractUserId } = require('../middlewares/extractUserId');
const { calculateRecommendedCalories } = require('../services/healthServices');
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require('../utils/responseHelper');

// Helper to handle missing authorization header
const handleAuthorizationError = (res) => {
  return res
    .status(401)
    .json({ status: 'error', message: 'Missing Authorization header' });
};

// Helper to handle validation errors
const handleValidationError = (res, message) => {
  return res.status(400).json({ status: 'error', message });
};

// Helper to handle general errors
const handleError = (res, error) => {
  res.status(500).json({ message: error.message || 'Internal Server Error' });
};

exports.getRecommendedCalories = async (req, res, next) => {
  const { height, desiredWeight, age, bloodGroupIndex, currentWeight } =
    req.body;

  // Validare date
  if (
    typeof height !== 'number' ||
    typeof desiredWeight !== 'number' ||
    typeof age !== 'number' ||
    typeof bloodGroupIndex !== 'number' ||
    typeof currentWeight !== 'number'
  ) {
    return sendErrorResponse(res, new Error('Invalid input data'), 400);
  }

  // Calculează caloriile recomandate
  const recommendedDailyCaloriesIntake = calculateRecommendedCalories(
    height,
    desiredWeight,
    age,
    currentWeight
  );

  try {
    // Verifică dacă există header-ul de autorizare
    if (!req.headers.authorization) return handleAuthorizationError(res);

    const userId = extractUserId(req.headers.authorization);

    // Validare index grup sanguin
    if (isNaN(bloodGroupIndex) || bloodGroupIndex < 1) {
      return sendErrorResponse(
        res,
        new Error('Invalid blood group index'),
        400
      );
    }

    // Obține produsele restricționate pe baza grupului sanguin
    const result =
      await healthService.getCategoriesForBloodGroup(bloodGroupIndex);

    // Dacă nu sunt produse pentru acest grup sanguin, returnează un mesaj
    if (!result || result.length === 0) {
      return sendErrorResponse(
        res,
        new Error('No products found for this blood group index'),
        404
      );
    }

    // Mapare produse restricționate
    const restrictedAlimentsData = result.map((product) => ({
      categories: product.categories,
      title: product.title,
      calories: product.calories,
      weight: product.weight,
    }));

    // Poți actualiza utilizatorul în baza de date cu noile informații (dacă este cazul)
    const user = await User.findById(userId);
    if (!user) {
      return sendErrorResponse(res, new Error('User not found'), 404);
    }

    console.log(user);

    // Actualizarea utilizatorului cu caloriile recomandate și alte date
    user.dailyCalorieIntake = Math.round(recommendedDailyCaloriesIntake);
    user.restrictedAliments = restrictedAlimentsData;
    user.height = height;
    user.weight = currentWeight;
    user.desiredWeight = desiredWeight;
    user.age = age;
    user.bloodType = bloodGroupIndex;

    await user.save();

    // Trimite răspunsul de succes cu datele
    sendSuccessResponse(res, {
      restrictedAliments: restrictedAlimentsData,
      recommendedDailyCaloriesIntake: Math.round(
        recommendedDailyCaloriesIntake
      ),
    });
  } catch (error) {
    sendErrorResponse(res, error, 500);
    next(error);
  }
};

exports.addConsumedProduct = async (req, res, next) => {
  const { product, date, quantity, kcal, name, weight } = req.body;

  console.log(product, date, weight);
  if (!product || !date || !weight || weight <= 0) {
    return handleValidationError(
      res,
      'Invalid input. Please provide product, date, and a valid quantity.'
    );
  }

  try {
    if (!req.headers.authorization) return handleAuthorizationError(res);

    const userId = extractUserId(req.headers.authorization);
    const updatedUser = await addConsumedProduct(
      userId,
      product,
      date,
      quantity,
      kcal,
      name,
      weight
    );

    res.status(200).json({
      status: 'success',
      message: updatedUser.message,
      data: updatedUser.user,
    });
  } catch (error) {
    handleError(res, error);
    next(error);
  }
};

exports.deleteConsumedProductForUser = async (req, res) => {
  const { productId, date } = req.body; // Preluăm din corpul cererii

  try {
    if (!req.headers.authorization) return handleAuthorizationError(res);

    const userId = extractUserId(req.headers.authorization);
    const response = await deleteConsumedProduct(userId, productId, date);
    res.status(200).json({ success: true, message: response.message });
  } catch (error) {
    if (
      error.message === 'User not found' ||
      error.message === 'Product not found or not consumed on that date'
    ) {
      return res.status(404).json({ success: false, message: error.message });
    }
    handleError(res, error);
  }
};

exports.getConsumedInfoForSpecificDay = async (req, res) => {
  const { date } = req.params;

  try {
    if (!req.headers.authorization) return handleAuthorizationError(res);

    const userId = extractUserId(req.headers.authorization);
    const result = await getConsumedInfoForDate(userId, date);

    res.status(200).json({
      success: true,
      dailyCalorieIntake: result.dailyCalorieIntake,
      totalCaloriesConsumed: result.totalCaloriesConsumed,
      remainingCalories: result.remainingCalories,
      percentageCaloriesConsumed: result.percentageCaloriesConsumed,
      consumedProducts: result.consumedProducts,
    });
  } catch (error) {
    if (error.message === 'No consumed products found for this date') {
      return res.status(404).json({
        success: false,
        message: 'No consumed products found for the given date',
      });
    }
    handleError(res, error);
  }
};
