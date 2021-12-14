const express = require('express');
const {
  getAllUsers,
  addNewUser,
  getUser,
  updateUser,
  adminDeleteUser,
  adminUpdateUser,
  usersDeletesAccount,
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
const restrictTo = require('../middleware/RolesPermisionMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

// TODO check why verification link is not working properly
router.post('/verify-email/:token', verifyUserEmailToken);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.use(auth); // this will protect all the routes that comes after this line with the auth middleware
router.patch('/update-password', updatePassword);
router.patch('/update-account', updateUser);
router.delete('/delete-account', usersDeletesAccount);

router.route('/me').get(getUser);
router
  .route('/')
  .get(restrictTo('admin'), getAllUsers)
  .post(restrictTo('admin'), addNewUser);
router
  .route('/:id')
  .patch(restrictTo('admin'), adminUpdateUser)
  .delete(restrictTo('admin'), adminDeleteUser);

module.exports = router;
