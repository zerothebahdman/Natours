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

exports.getAllTours = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludeKeyWords = ['sort', 'page', 'limit', 'fields'];
    excludeKeyWords.forEach((element) => delete queryObj[element]);
    const query = Tour.find(queryObj);

    const tours = await query;
    res
      .status(200)
      .json({ status: 'success', results: tours.length, data: { tours } });
  } catch (err) {
    res.status(404).json({ status: 'Error', message: err.message });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({ status: 'success', data: { tour } });
  } catch (err) {
    res.status(404).json({ status: 'Error', message: err.message });
  }
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

exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: 'success', data: updatedTour });
  } catch (err) {
    res.status(404).json({ status: 'Error', message: err.message });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', message: 'Tour Deleted' });
  } catch (err) {
    res.status(404).json({ status: 'error', message: err.message });
  }
};
