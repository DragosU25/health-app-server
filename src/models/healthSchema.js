const mongoose = require('mongoose');

const healthSchema = new mongoose.Schema({
  categories: String,
  weight: Number,
  title: String,
  calories: Number,
  groupBloodNotAllowed: [Boolean],
});

const Health = mongoose.model('health', healthSchema);

module.exports = Health;
