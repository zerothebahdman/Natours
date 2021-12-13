const express = require('express');
const {
  getAllTours,
  addNewTour,
  updateTour,
  deleteTour,
  getTour,
  alliasTop5Tours,
  getToursStats,
  getMonthlyPlan,
  //checkId,
  //checkBody,
} = require('../controllers/ToursController');
const reviewRouter = require('./ReviewRouter');

const restrictTo = require('../middleware/RolesPermisionMiddleware');
const auth = require('../middleware/AuthMiddleware');

const router = express.Router({ mergeParams: true });

// Using nested routes with the use() middleware. When this is mounted, all api endpoints in the reviewRouter route will be prefixed with (/:tourId/reviews)
router.use('/:tourId/reviews', reviewRouter);

// router.param('id', checkId);
// router.route('/').get(getAllTours).post(checkBody, addNewTour); the (checkbody) is a nodejs middleware that checks if a field is empty. To pass middlewares in a route you add it as the first parameter then the controller function as the second parameter.
router.route('/').get(getAllTours).post(addNewTour);
router.route('/top-5-tours').get(alliasTop5Tours, getAllTours);
router.route('/tour-stats').get(getToursStats);
router
  .route('/:id')
  .patch(auth, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(auth, restrictTo('admin', 'lead-guide'), deleteTour)
  .get(getTour);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

module.exports = router;
