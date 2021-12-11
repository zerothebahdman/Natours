const { createHash } = require(`crypto`);
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppErrorClass');
const sendEmail = require('../utils/email');

const jwtToken = (id, email) =>
  jwt.sign({ id, email }, process.env.JWT_SECRET_TOKEN, {
    expiresIn: process.env.JWT_EXPIRATION,
  });

const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIES_EXPIRATION * 24 * 60 * 60 * 1000
  ),
  // This ensures that the cookie is only set while in production HTTPS mode
  secure: false,
  // HttpOnly ensures that the cookie will not be accessed and modified by the browser. This is important to prevent
  httpOnly: true,
};
if (process.env.APP_ENV === 'production') cookieOptions.secure = true;

exports.verifyUserEmailToken = async (req, res, next) => {
  try {
    // 1) Check that the token was not tempered with
    const hashedEmailToken = createHash('sha256')
      .update(req.params.token)
      .digest('base64');
    // 2) If the token has not expired and the email is valid verify the email
    const user = await User.findOne({
      email_verification_token: hashedEmailToken,
      email_verification_token_expires_at: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError(`The email verification link has expired`, 401));
    }

    // 3, Verify the email
    user.email_verified_at = Date.now();
    user.email_verification_token = undefined;
    user.email_verification_token_expires_at = undefined;
    user.save({ validateBeforeSave: false });

    // 4) Login the user and set new JWT token for user
    const token = jwtToken(user._id, user.email);
    res.cookie('JWT', token, cookieOptions);
    res.status(201).json({
      status: `success`,
      message: 'Your email has been verified',
      token,
    });
  } catch (err) {
    return next(new AppError(err.message, err.status));
  }
};
exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      password: req.body.password,
      password_confirmation: req.body.password_confirmation,
    });
    const verificationToken = newUser.verify_user_email();
    await newUser.save({ validateBeforeSave: false });

    const verifyUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/verify-email/${verificationToken}`;

    const message = `Hello, ${newUser.name} you just created an account on Natours.\n\n We need to ensure that the email address you provided is a valid one, so please verify your email address. \n\n\n ${verifyUrl}\n\n If you didnt create this account, please ignore this email`;

    await sendEmail({
      email: newUser.email,
      subject: `[Natours] Email Verification Link`,
      message,
    });

    const token = jwtToken(newUser._id, newUser.email);
    res.cookie('JWT', token, cookieOptions);
    // This will hide the password field from displaying on the req output
    newUser.password = undefined;
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
  res.cookie('JWT', token, cookieOptions);
  res.status(200).json({ status: 'success', token });
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
