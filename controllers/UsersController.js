const User = require('../models/UserModel');
const AppError = require('../utils/AppError');

exports.getAllUsers = async (req, res, next) => {
  try {
    const user = await User.find();
    res.status(200).json({ status: `success`, user });
  } catch (err) {
    return next(new AppError(err.message, 404));
  }
};
exports.addNewUser = (req, res) => {
  res.status(200).json({ status: 'success', message: 'Route Pending' });
};
exports.getUser = (req, res) => {
  res.status(200).json({ status: 'success', message: 'Route Pending' });
};
exports.updateUser = (req, res) => {
  res.status(200).json({ status: 'success', message: 'Route Pending' });
};
exports.deleteUser = (req, res) => {
  res.status(200).json({ status: 'success', message: 'Route Pending' });
};
