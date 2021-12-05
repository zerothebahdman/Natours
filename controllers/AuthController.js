const { promisify } = require('util');
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

exports.protectRoute = async (req, res, next) => {
  try {
    // 1) Get the token for the current user
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) next(new AppError(`You are not logged in. Please login`, 401));

    // 2) Verify the token
    const decodedToken = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET_TOKEN
    );

    // 3) Check if user still exists
    const freshUser = await User.findById(decodedToken.id);
    if (!freshUser) {
      return next(new AppError(`No user exists with the token`), 401);
    }

    // 4) Check if user changed password after token was isssued
    if (freshUser.changedPasswordAfterSettingToken(decodedToken.iat))
      next(
        new AppError(
          `User recently changed their password, Please login again`,
          401
        )
      );
    // Grants access to protected route
    req.user = freshUser;
    next();
  } catch (err) {
    return next(new AppError(err.message, err.status));
  }
};
