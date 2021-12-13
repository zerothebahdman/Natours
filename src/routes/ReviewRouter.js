const express = require('express');
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
} = require('../controllers/ReviewsController');
const auth = require('../middleware/AuthMiddleware');
const restrictTo = require('../middleware/RolesPermisionMiddleware');

const router = express.Router({ mergeParams: true });
// By default each router only has access to the parameters of their specific route. mergeParams preserves the req.params value from the parent router which in the case is (TourRouter) and because of this all our api endpoint in this file will be prefixed with `/:tourId/reviews`

router.route('/').get(getAllReviews);

// Because mergeParams is set to true we already have /:tourId/reviews prefixed in this endpoint so bascially the api endpoint is /:tourId/reviews/create so if the controller in this insance needs the value of the req.params, it is already passed in the endpoint
router.route('/create').post(auth, restrictTo('user'), createReview);
router.route('/:id').patch(auth, updateReview).delete(auth, deleteReview);

module.exports = router;
