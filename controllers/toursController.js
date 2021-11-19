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

// Middleware
exports.alliasTop5Tours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // Filetering
    const queryObj = { ...req.query };
    const excludeKeyWords = ['sort', 'page', 'limit', 'fields'];
    excludeKeyWords.forEach((element) => delete queryObj[element]);
    // const query = Tour.find(queryObj);

    // Advanced filtering
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    let query = Tour.find(JSON.parse(queryString));

    // Sorting Record from Database
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query.sort('-creagted_at');
    }

    //Field Limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    //pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const numberOfTours = Tour.countDocuments();
      if (skip >= numberOfTours) {
        throw new Error('Page not found');
      }
    }
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
