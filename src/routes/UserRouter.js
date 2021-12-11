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
  verifyUserEmailToken,
} = require('../controllers/AuthController');

const auth = require('../middleware/AuthMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

// TODO check why verification link is not working properly
router.post('/verify-email/:token', verifyUserEmailToken);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.patch('/update-password', auth, updatePassword);
router.patch('/update-account', auth, updateUser);
router.delete('/delete-account', auth, deleteUser);

router.route('/').get(getAllUsers).post(addNewUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
