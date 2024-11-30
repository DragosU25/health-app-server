const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET;

exports.extractUserId = (authHeader) => {
  const token = authHeader.split(' ')[1];
  const user = jwt.verify(token, secret);
  return user.id;
};
