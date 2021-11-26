const User = require('../models/UserModel');

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json({ status: `success`, data: { newUser } });
  } catch (err) {
    res.satus(500).json({ status: `Error`, message: err.message });
  }
};
