const express = require('express');
const {
  getAllReviews,
  createReview,
} = require('../controllers/ReviewsController');
const auth = require('../middleware/AuthMiddleware');
const restrictTo = require('../middleware/RolesPermisionMiddleware');

const router = express.Router();

router
  .route('/')
  .get(getAllReviews)
  .post(auth, restrictTo('user'), createReview);

module.exports = router;
