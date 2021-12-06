const express = require('express');
const {
  getAllUsers,
  addNewUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/UsersController');
const {
  signup,
  login,
  resetPassword,
  forgotPassword,
} = require('../controllers/AuthController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.route('/').get(getAllUsers).post(addNewUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
