const express = require('express');
const {
  getAllUsers,
  addNewUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/UsersController');
const { signup } = require('../controllers/AuthController');

const router = express.Router();

router.post('/signup', signup);

router.route('/').get(getAllUsers).post(addNewUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
