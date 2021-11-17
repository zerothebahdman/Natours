const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Opps! Tour name can't be empty"],
    unique: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'Opps! This tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'Opps! Max group size can be empty'],
  },
  difficulty: {
    type: String,
    required: [true, 'Opps! Tour must have a difficulty level'],
  },
  price: { type: Number, required: [true, "Opps! price can't be empty"] },
  ratingAverage: { type: Number, default: 3 },
  ratingQuantity: { type: Number, default: 0 },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
    required: [true, 'Opps! tour must have summary'],
  },
  description: { type: String, trim: true },
  image: { type: String, required: [true, 'Opps! Tour must have an image'] },
  images: [String],
  created_at: { type: Date, default: Date.now() },
  startDates: [Date],
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
