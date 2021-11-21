const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Opps! Tour name can't be empty"],
      unique: true,
      trim: true,
    },
    slug: { type: String, unique: true, trim: true },
    duration: {
      type: Number,
      required: [true, 'Opps! This tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, `Opps! Max group size can't be empty`],
    },
    difficulty: {
      type: String,
      required: [true, 'Opps! Tour must have a difficulty level'],
    },
    price: { type: Number, required: [true, "Opps! price can't be empty"] },
    ratingsAverage: { type: Number, default: 3 },
    ratingsQuantity: { type: Number, default: 0 },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'Opps! tour must have summary'],
    },
    description: { type: String, trim: true },
    image: { type: String, required: [true, 'Opps! Tour must have an image'] },
    images: [String],
    created_at: { type: Date, default: Date.now(), select: false },
    startDates: [Date],
    secretTours: { type: Boolean, default: false },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Creating virtual properties in mongoose schema which wont be percisted in the database but will be available when we get the data
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// Document middleware runs before the .save() or .create() method, this wont work for findByIdAndUpdate
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Query middleware
// Use a regex to find all strings that match find or starts with find
tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function (next) {
  this.find({ secretTours: { $ne: true } });
  next();
});

// Document middleware runs after the .save() or .create() method
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
