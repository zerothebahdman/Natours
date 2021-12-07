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
  updatePassword,
  protectRoute,
} = require('../controllers/AuthController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.patch('/update-password', protectRoute, updatePassword);
router.patch('/update-account', protectRoute, updateUser);

router.route('/').get(getAllUsers).post(addNewUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
