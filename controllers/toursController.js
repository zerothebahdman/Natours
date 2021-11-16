const Tour = require('../models/tourModel');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkId = (req, res, next, value) => {
//   console.log(`Tour id is: ${value}`);
//   if (Number(req.params.id) > tours.length) {
//     return res.status(404).json({ status: 'error', message: 'Invalid ID' });
//   }
// };

// exports.checkBody = (req, res, next) => {
//   if (req.body.name === undefined && req.body.price === undefined) {
//     return res
//       .status(400)
//       .json({ status: 'fail', message: 'Name and Price cannot be empty' });
//   }
//   next();
// };

exports.getAllTours = (req, res) => {
  console.log(req.time);
  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } });
};

exports.getTour = (req, res) => {
  console.log(req.params);
  let id = Number(req.params.id);
  const tour = tours.find((tour) => tour.id === id);

  res.status(200).json({ status: 'success', data: { tour } });
};

exports.addNewTour = async (req, res) => {
  try {
    // const newTour = await new Tour(req.body);
    // newTour.save();
    const newTour = await Tour.create(req.body);
    res.status(201).json({ status: 'success', data: { tours: newTour } });
  } catch (err) {
    console.log(`ERROR 💣 ${err}`);
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.updateTour = (req, res) => {
  res.status(200).json({ status: 'success', data: 'Expected Tour' });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({ status: 'success', message: 'Tour Deleted' });
};
