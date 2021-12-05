const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const AppError = require('../utils/AppError');

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      password_confirmation: req.body.password_confirmation,
    });
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_TOKEN, {
      expiresIn: process.env.JWT_EXPIRATION,
    });
    res.status(201).json({ status: `success`, token, data: { newUser } });
  } catch (err) {
    return next(new AppError(err.message, err.status));
  }
};
