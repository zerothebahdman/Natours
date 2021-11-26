const mongoose = require('mongoose');
const validator = require('validator');

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
  },
});
const User = mongoose.model('User', UserModel);
module.exports = User;
