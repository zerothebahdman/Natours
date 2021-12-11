const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    review: { type: String, required: [true, 'Opps! Review cant be empty.'] },
    rating: { type: Number, min: 1, max: 5 },
    // Implementing parent referencing with tour and user in the review document
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour', //the model name must start with a capital letter
      required: [true, 'Opps! review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', //the model name must start with a capital letter
      required: [true, 'Opps! Review must belong to a user'],
    },
    created_at: { type: Date, default: Date.now() },
    updated_at: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Query middleware
// Use a regex to find all strings that match find or starts with find
ReviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'tour', select: 'name' }).populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

const Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;
