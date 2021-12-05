const User = require('../models/UserModel');
const AppError = require('../utils/AppError');

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json({ status: `success`, data: { newUser } });
  } catch (err) {
    return next(new AppError(err.message, err.status));
  }
};
