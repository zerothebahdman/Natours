const User = require('../models/UserModel');
const AppError = require('../utils/AppErrorClass');

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
exports.updateUser = async (req, res, next) => {
  try {
    // 1) Create error if user tries to update password
    const { password, passwordConfirmation, name, email } = req.body;
    if (password || passwordConfirmation) {
      return next(
        new AppError(`You cant edit your password using this endpoint`, 400)
      );
    }
    // 2) Update user document
    const updateUser = await User.findByIdAndUpdate(
      req.user._id,
      { name: name, email: email },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({ status: 'success', user: updateUser });
  } catch (err) {
    return next(new AppError(err.message, err.status));
  }
};
exports.deleteUser = (req, res) => {
  res.status(200).json({ status: 'success', message: 'Route Pending' });
};
