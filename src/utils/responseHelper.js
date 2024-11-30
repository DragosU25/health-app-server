const sendSuccessResponse = (
  res,
  data,
  status = 200,
  recommendedCalories = null
) => {
  res.status(status).json({
    status: 'success',
    data,
    recommendedCalories,
  });
};

const sendErrorResponse = (res, error, status = 500) => {
  res.status(status).json({
    status: 'error',
    message: error.message,
  });
};

module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
};
