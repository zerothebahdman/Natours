const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const AppError = require('../utils/AppErrorClass');
const User = require('../models/User');

// / Middleware to store authenticated user information and also prevent non authenticated users from proteted routes
const auth = async (req, res, next) => {
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
    if (freshUser.changed_password_after_setting_token(decodedToken.iat))
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

module.exports = auth;
