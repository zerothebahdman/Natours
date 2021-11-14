const fs = require('fs');
const express = require('express');
const {
  getAllTours,
  addNewTour,
  updateTour,
  deleteTour,
  getTour,
  checkId,
  checkBody,
} = require('./../controllers/toursController');
const router = express.Router();

router.param('id', checkId);
router.route('/').get(getAllTours).post(checkBody, addNewTour);
router.route('/:id').patch(updateTour).delete(deleteTour).get(getTour);

module.exports = router;
