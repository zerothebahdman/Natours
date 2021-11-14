const fs = require('fs');
const express = require('express');
const {
  getAllTours,
  addNewTour,
  updateTour,
  deleteTour,
  getTour,
} = require('./../controllers/toursController');
const router = express.Router();

router.route('/').get(getAllTours).post(addNewTour);
router.route('/:id').patch(updateTour).delete(deleteTour).get(getTour);

module.exports = router;
