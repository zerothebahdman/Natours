const AppError = require('../utils/AppErrorClass');
const Reviews = require('../models/Reviews');

exports.getAllReviews = async (req, res, next) => {
  try {
    const review = await Reviews.find(); // there's a query middleware that runs in the ReviewSchema to populate relationships
    res.status(200).json({ status: 'success', results: review.length, review });
  } catch (err) {
    return next(new AppError(err.message, err.status));
  }
};

exports.createReview = async (req, res, next) => {
  const { review, rating, tour } = req.body;
  try {
    const newReview = await Reviews.create({
      review: review,
      rating: rating,
      tour: tour,
      user: req.user._id,
    });
    res.status(201).json({ status: 'success', newReview });
  } catch (err) {
    return next(new AppError(err.message, err.status));
  }
};
