const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const AppError = require('../utils/AppError');

const jwtToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET_TOKEN, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      password_confirmation: req.body.password_confirmation,
    });
    const token = jwtToken(newUser._id);
    res.status(201).json({ status: `success`, token, data: { newUser } });
  } catch (err) {
    return next(new AppError(err.message, err.status));
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  // Check if email and password exist
  if (!email || !password) {
    return next(
      new AppError(
        'Invalid Input, Please provide a valid email or password',
        400
      )
    );
  }
  // check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  // Defined an instance method verifiedPassword in the user document
  if (!user || !(await user.verifiedPassword(password, user.password))) {
    return next(new AppError(`Incorrect email or password`, 401));
  }
  // send JWT token to client
  const token = jwtToken(user._id);
  res.status(200).json({ status: 'success', token });
};
