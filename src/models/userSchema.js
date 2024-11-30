const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const { required } = require('joi');

const consumedProductSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Health' },
  date: { type: Date, required: true },
  quantity: { type: Number },
  calories: { type: Number },
  name: { type: String },
  weight: { type: Number, required: true },
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      minLength: 3,
      required: [true, 'Username required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    height: {
      type: Number,
      default: 0,
    },
    desiredWeight: {
      type: Number,
      default: 0,
    },
    age: {
      type: Number,
      default: 0,
    },
    bloodType: {
      type: Number,
      default: 0,
    },
    weight: {
      type: Number,
      default: 0,
    },
    token: {
      type: String,
      default: null,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String || null,
    },
    dailyCalorieIntake: {
      type: Number,
      required: true,
      default: 0,
    },

    userDiary: {
      totalCaloriesConsumed: { type: Number, default: null },
      remainingCalories: { type: Number, default: null },
      percentageCaloriesConsumed: { type: Number, default: null },
    },

    restrictedAliments: [
      {
        categories: { type: String },
        title: { type: String },
        calories: { type: Number },
        weight: { type: Number },
      },
    ],

    consumedProducts: [consumedProductSchema],
  },
  { versionKey: false, timestamps: true }
);

userSchema.methods.setPassword = function (password) {
  this.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.pre('save', function (next) {
  if (!this.avatarURL) {
    this.avatarURL = gravatar.url(
      this.email,
      { s: 200, r: 'pg', d: 'identicon' },
      true
    );
  }
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
