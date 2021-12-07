const { createHash } = require(`crypto`);
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const AppError = require('../utils/AppErrorClass');
const sendEmail = require('../utils/email');

const jwtToken = (id, email) =>
  jwt.sign({ id, email }, process.env.JWT_SECRET_TOKEN, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      password: req.body.password,
      password_confirmation: req.body.password_confirmation,
    });
    const token = jwtToken(newUser._id, newUser.email);
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
  const token = jwtToken(user._id, user.email);
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

// ----Implementing Authorization: User roles and permission----
// create an arbitrary function that returns the authorization middleware function
exports.restrictTo =
  (...roles) =>
  // roles in this instance is a array coming from the tour route ['admin', 'lead-guide']
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`You dont have permission to perform this action`, 403)
      );
    }

    next();
  };

exports.forgotPassword = async (req, res, next) => {
  // 1) Get user based on email address
  const user = await User.findOne({ email: req.body.email });
  try {
    if (!user) {
      return next(
        new AppError(
          `Opps! user with this email (${req.body.email}) does not exit`,
          404
        )
      );
    }
    // 2) Generate random reset token
    const resetToken = user.change_password_reset_token();
    console.log(resetToken);
    // -----------validateBeforeSave set to false will deactivate all validators that we have in our schemas
    await user.save({ validateBeforeSave: false });
    // 3) Send the token back to user
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/reset-password/${resetToken}`;

    const message = `Find below your password reset link.\n\n ${resetUrl}\n\n Your password reset tokern is valid for 10 min. \n\n\n If you didn't forget your password, please ignore this email.`;

    await sendEmail({
      email: user.email,
      subject: `[${user.name}], Password reset link`,
      message,
    });

    res.status(200).json({
      status: `success`,
      message: `Token has been sent to email successfully`,
    });
  } catch (err) {
    user.password_reset_token = undefined;
    user.password_reset_token_expires_at = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError(err.message, err.status));
  }
};
exports.resetPassword = async (req, res, next) => {
  try {
    // 1) Get user based on token
    const hashedToken = createHash('sha256')
      .update(req.params.token)
      .digest('base64');
    const user = await User.findOne({
      password_reset_token: hashedToken,
      password_reset_token_expires_at: { $gt: Date.now() },
    });
    // 2) If the token has not expired and the user exists, then change password
    if (!user)
      return next(new AppError(`The password reset token has expired`, 400));
    // 3) Update the field password_updated_at on the db
    user.password = req.body.password;
    user.password_confirmation = req.body.password_confirmation;
    user.password_reset_token = undefined;
    user.password_reset_token_expires_at = undefined;
    user.password_updated_at = Date.now() - 1000;
    await user.save();
    // 4) Login the user and set new JWT token for user
    const token = jwtToken(user._id, user.email);
    res.status(201).json({ status: `success`, token });
  } catch (err) {
    return next(new AppError(err.message, err.status));
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    // 1) Get the user form the collection
    const user = await User.findOne({ id: req.user._id }).select('+password');
    // 2) Check that the provided password is correct
    const checkHashedPassword = await user.verifiedPassword(
      req.body.current_password,
      user.password
    );
    if (!checkHashedPassword) {
      return next(
        new AppError(
          `The provided password is incorrect. Please provide the correct password`,
          401
        )
      );
    }
    // 3) Update the user password
    user.password = req.body.password;
    user.password_confirmation = req.body.password_confirmation;
    user.password_updated_at = Date.now() - 1000;
    await user.save();
    // 4) login the user and set new JWT token for user
    const token = jwtToken(user._id, user.email);
    res.status(201).json({ status: `success`, token });
  } catch (err) {
    return next(new AppError(err.message, err.status));
  }
};
