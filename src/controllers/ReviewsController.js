const AppError = require('../utils/AppErrorClass');
const Reviews = require('../models/Reviews');

exports.getAllReviews = async (req, res, next) => {
  try {
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }
    const review = await Reviews.find(filter); // there's a query middleware that runs in the ReviewSchema to populate relationships
    res.status(200).json({ status: 'success', results: review.length, review });
  } catch (err) {
    return next(new AppError(err.message, err.status));
  }
};

exports.createReview = async (req, res, next) => {
  const { review, rating, tour, user } = req.body;
  try {
    const newReview = await Reviews.create({
      review: review,
      rating: rating,
      tour: !tour ? req.params.tourId : tour,
      user: !user ? req.user._id : user,
    });
    res.status(201).json({ status: 'success', newReview });
  } catch (err) {
    return next(new AppError(err.message, err.status));
  }
};
