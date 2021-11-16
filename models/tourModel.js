const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Opps! Tour name can't be empty"],
    unique: true,
  },
  price: { type: Number, required: [true, "Opps! price can't be empty"] },
  rating: { type: Number, default: 3 },
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
