const Health = require('../models/healthSchema');
const User = require('../models/userSchema');

exports.getCategoriesForBloodGroup = async (
  userId,
  recommendedDailyCaloriesIntake,
  height,
  desiredWeight,
  age,
  bloodGroupIndex,
  weight
) => {
  try {
    const result = await Health.find({
      [`groupBloodNotAllowed.${bloodGroupIndex}`]: false,
    });

    const restrictedAlimentsData = result.map((product) => ({
      categories: product.categories,
      title: product.title,
      calories: product.calories,
      weight: product.weight,
    }));

    // Verificăm ce date sunt trimise pentru restrictedAliments
    console.log('restrictedAlimentsData:', restrictedAlimentsData);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'dietaryInfo.restrictedAliments': restrictedAlimentsData,
          'dietaryInfo.dailyCalorieIntake': Math.round(
            recommendedDailyCaloriesIntake
          ),
          height: height,
          desiredWeight: desiredWeight,
          age: age,
          bloodType: bloodGroupIndex,
          weight: weight,
        },
      },
      { new: true }
    );

    // Verificăm ce s-a salvat în baza de date
    console.log('User after update:', user);

    return user;
  } catch (error) {
    throw new Error('Error fetching categories for the specified blood group');
  }
};

exports.addConsumedProduct = async (
  userId,
  product,
  date,
  quantity,
  kcal,
  name,
  weight
) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const consumedProduct = {
      product,
      name,
      weight,
      date: new Date(date),
      quantity,
      calories: (kcal / 100) * weight,
    };

    user.consumedProducts.push(consumedProduct);

    // Filter the consumed products for the specific date
    const consumedProducts = user.consumedProducts.filter(
      (p) =>
        p.date.toISOString().split('T')[0] ===
        new Date(date).toISOString().split('T')[0]
    );

    if (consumedProducts.length === 0)
      throw new Error('No consumed products found for this date');

    const totalCaloriesConsumed = consumedProducts.reduce(
      (sum, p) => sum + p.calories,
      0
    );

    const dailyCalorieIntake = user.dailyCalorieIntake;
    const remainingCalories = dailyCalorieIntake - totalCaloriesConsumed;
    const percentageCaloriesConsumed =
      (totalCaloriesConsumed / dailyCalorieIntake) * 100;

    // Update the user object with the calculated values
    user.userDiary.totalCaloriesConsumed = totalCaloriesConsumed;
    user.userDiary.remainingCalories = remainingCalories;
    user.userDiary.percentageCaloriesConsumed = percentageCaloriesConsumed;

    await user.save();

    return {
      message: 'Product consumed added successfully',
      user,
      dailyCalorieIntake,
      totalCaloriesConsumed,
      remainingCalories,
      percentageCaloriesConsumed,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.deleteConsumedProduct = async (userId, productId, date) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const consumedIndex = user.consumedProducts.findIndex(
      (p) =>
        p.product.toString() === productId &&
        p.date.toISOString().split('T')[0] ===
          new Date(date).toISOString().split('T')[0] // Compare date correctly
    );

    if (consumedIndex === -1)
      throw new Error('Product not found or not consumed on that date');

    const consumedProduct = user.consumedProducts[consumedIndex];

    // Remove consumed product from list
    user.consumedProducts.splice(consumedIndex, 1);

    // Recalculate userDiary values
    const consumedProducts = user.consumedProducts.filter(
      (p) =>
        p.date.toISOString().split('T')[0] ===
        new Date(date).toISOString().split('T')[0]
    );

    const totalCaloriesConsumed = consumedProducts.reduce(
      (sum, p) => sum + p.calories,
      0
    );

    console.log(totalCaloriesConsumed);
    const dailyCalorieIntake = user.dailyCalorieIntake;
    const remainingCalories = dailyCalorieIntake - totalCaloriesConsumed;
    const percentageCaloriesConsumed =
      (totalCaloriesConsumed / dailyCalorieIntake) * 100;

    // Update the user object with the calculated values
    user.userDiary.totalCaloriesConsumed = totalCaloriesConsumed;
    user.userDiary.remainingCalories = remainingCalories;
    user.userDiary.percentageCaloriesConsumed = percentageCaloriesConsumed;

    await user.save();

    return {
      message: 'Consumed product deleted successfully',
      user,
      dailyCalorieIntake,
      totalCaloriesConsumed,
      remainingCalories,
      percentageCaloriesConsumed,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getConsumedInfoForDate = async (userId, date) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const consumedProducts = user.consumedProducts.filter(
      (p) =>
        p.date.toISOString().split('T')[0] ===
        new Date(date).toISOString().split('T')[0]
    );

    if (consumedProducts.length === 0)
      throw new Error('No consumed products found for this date');

    return {
      consumedProducts,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};
