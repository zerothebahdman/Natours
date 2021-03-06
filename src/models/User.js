const { randomBytes, createHash } = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserModel = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `Opps! you need to specify a name`],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Opps! you need to specify a valid email'],
  },
  profile_photo: String,
  role: {
    type: String,
    enum: ['admin', 'user', 'guide', 'lead-guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: true,
    minlength: [
      8,
      `Opps! your password needs to be at least 8 characters long`,
    ],
    select: false,
  },
  password_confirmation: {
    type: String,
    required: true,
    minlength: [
      8,
      `Opps! your password needs to be at least 8 characters long`,
    ],
    validate: {
      // This works only on CREATE && SAVE event triggered from mongo
      validator: function (el) {
        return el === this.password;
      },

      message: `Password's do not match`,
    },
  },
  password_updated_at: Date,
  password_reset_token: String,
  password_reset_token_expires_at: Date,
  email_verified_at: Date,
  email_verification_token: String,
  email_verification_token_expires_at: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Manipulate user password before its saved to the database
UserModel.pre('save', async function (next) {
  //Only runs this function if password was modified
  if (!this.isModified('password')) {
    return next();
  }

  // Hashing users password using node crypto module
  this.password = await bcrypt.hash(this.password, 13);

  // Delete the password confirm field from the database.
  this.password_confirmation = undefined;
  next();
});

//  this is a querry middleware that runs before every querry
// UserModel.pre(/^find/, function (next) {
//   this.find({ active: { $ne: false } });
//   next();
// });

// Define an instance method to check password
UserModel.methods.verifiedPassword = async (
  incomingUserPassword,
  storedUserPassword
) => await bcrypt.compare(incomingUserPassword, storedUserPassword);

UserModel.methods.changed_password_after_setting_token = function (
  jwtTimestamp
) {
  if (this.passwordUpdatedAt) {
    const changedTimestamp = parseInt(
      this.passwordUpdatedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimestamp, jwtTimestamp);
    return jwtTimestamp < changedTimestamp;
    // This returns either true or false
  }
  return false;
};
UserModel.methods.verify_user_email = function () {
  const token = randomBytes(32).toString('base64');
  this.email_verification_token = createHash('sha256')
    .update(token)
    .digest('base64');
  console.log({ token }, this.email_verification_token);
  this.email_verification_token_expires_at = Date.now() + 10 * 60 * 1000;
  return token;
};
UserModel.methods.change_password_reset_token = function () {
  // generates the token that will be sent to the user
  const token = randomBytes(32).toString('base64');
  // hashes the token and stores the token in the database
  this.password_reset_token = createHash('sha256')
    .update(token)
    .digest('base64');
  console.log({ token }, this.password_reset_token);
  // creates an expiration time for the password reset token
  this.password_reset_token_expires_at = Date.now() + 10 * 60 * 1000;
  // returns the plain token to be sent to the user via email
  return token;
};
const User = mongoose.model('User', UserModel);
module.exports = User;
