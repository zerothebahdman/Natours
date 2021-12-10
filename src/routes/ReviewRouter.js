const express = require('express');
const {
  getAllReviews,
  createReview,
} = require('../controllers/ReviewsController');
const { protectRoute, restrictTo } = require('../controllers/AuthController');

const router = express.Router();

router
  .route('/')
  .get(getAllReviews)
  .post(protectRoute, restrictTo('user'), createReview);

module.exports = router;
