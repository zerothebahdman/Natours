const User = require('../models/User');
const AppError = require('../utils/AppErrorClass');

exports.getAllUsers = async (req, res, next) => {
  try {
    const user = await User.find({ active: { $ne: false } });
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
    const { password, passwordConfirmation, name, email } = req.body;
    // 1) Create error if user tries to update password
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
exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { active: false });
    res
      .status(204)
      .json({ status: 'success', message: 'Deleted Successfully' });
  } catch (err) {
    return next(new AppError(err.message, err.status));
  }
};
