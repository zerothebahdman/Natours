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
    passwordUpdatedAt: Date,
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
// Define an instance method to check password
UserModel.methods.verifiedPassword = async (
  incomingUserPassword,
  storedUserPassword
) => await bcrypt.compare(incomingUserPassword, storedUserPassword);

UserModel.methods.changedPasswordAfterSettingToken = (jwtTimestamp) => {
  if (this.passwordUpdatedAt) {
    const changedTimestamp = parseInt(
      this.passwordUpdatedAt.getTime() / 1000,
      10
    );
    console.log(changedTimestamp, jwtTimestamp);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};
const User = mongoose.model('User', UserModel);
module.exports = User;
