const mongoose = require('mongoose');
const validator = require('validator');
const { createHash, randomBytes } = require('crypto');

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
});

// Manipulate user password before its saved to the database
UserModel.pre('save', async function (next) {
  //Only runs this function if password was modified
  if (!this.isModified('password')) {
    return next();
  }

  // Hashing users password using node crypto module
  const salt = randomBytes(16).toString('base64');
  const hashedpassword = createHash('sha256')
    .update(this.password)
    .digest('base64');

  // const salt = randomBytes(16).toString('hex');
  // const hashedPassword = scryptSync(this.password, salt, 64);
  this.password = `${salt}${hashedpassword}`;

  // Delete the password confirm field from the database.
  this.password_confirmation = undefined;
});
const User = mongoose.model('User', UserModel);
module.exports = User;
