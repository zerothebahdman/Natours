const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      // Mongoose validators for strings
      required: [true, "Opps! Tour name can't be empty"],
      maxlength: [
        40,
        'Opps! A tour name must have a length less than or equal to 40',
      ],
      minlength: [
        10,
        'Opps! A tour name must have a length greater than or equal to 10',
      ],
      // validate: [
      //   validator.isAlpha,
      //   `Opps! Tour name must contain only letters`,
      // ],
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
      // Mongoose validators for strings
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'Opps! You can only specify either one of easy, medium or difficult',
      },
    },
    price: { type: Number, required: [true, "Opps! price can't be empty"] },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      // Mongoose validators for numbers
      min: [1, `Opps! Ratings must be above 1.0`],
      max: [5, `Opps! Rating must be below 5.0`],
    },
    ratingsQuantity: { type: Number, default: 0 },
    priceDiscount: {
      type: Number,
      // Specifying custom validators
      validate: {
        validator: function (value) {
          // this only points to current document being created on the database
          return value < this.price;
        },
        message: `Opps! The discount price {VALUE} cant be more than the price`,
      },
    },
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
// Document middleware runs after the .save() or .create() method
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// Query middleware
// Use a regex to find all strings that match find or starts with find
tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function (next) {
  this.find({ secretTours: { $ne: true } });
  next();
});

// Aggregation middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secrectTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
