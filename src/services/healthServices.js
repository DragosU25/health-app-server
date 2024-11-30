const Health = require('../models/healthSchema');

const getAllHealthProducts = async () => {
  try {
    const products = await Health.find({});
    return products;
  } catch (error) {
    throw new Error('Error fetching products from Health collection');
  }
};

const getCategoriesForBloodGroup = async (bloodGroupIndex) => {
  try {
    const result = await Health.find({
      [`groupBloodNotAllowed.${bloodGroupIndex}`]: false,
    });
    return result;
  } catch (error) {
    throw new Error('Error fetching categories for the specified blood group');
  }
};

const getCategoryByName = async (title) => {
  try {
    const products = await Health.find({
      title: { $regex: title, $options: 'i' },
    });
    if (!products || products.length === 0) {
      throw new Error('This aliment category does not exist!');
    }
    return products;
  } catch (err) {
    throw new Error(err.message);
  }
};

const calculateRecommendedCalories = (
  height,
  desiredWeight,
  age,
  currentWeight
) => {
  let recommendedDailyCaloriesIntake =
    10 * desiredWeight + 6.25 * height - 5 * age;

  if (desiredWeight !== currentWeight) {
    recommendedDailyCaloriesIntake +=
      desiredWeight > currentWeight ? 500 : -500;
  }

  return recommendedDailyCaloriesIntake;
};

module.exports = {
  getAllHealthProducts,
  getCategoriesForBloodGroup,
  getCategoryByName,
  calculateRecommendedCalories,
};
