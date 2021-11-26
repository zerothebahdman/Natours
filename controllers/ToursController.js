const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/ApiFeatures');
const AppError = require('../utils/AppError');
const GlobalErrorHandlerController = require('../middleware/GlobalErrorHandlerMiddleware');
const CatchAsyncErrors = require('../utils/CatchAsyncError');
// Middleware
exports.alliasTop5Tours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// return catch errors from async functions

exports.getAllTours = CatchAsyncErrors(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;
  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } });
});

exports.getTour = CatchAsyncErrors(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(
      new AppError(`Opps! No tour found with id (${req.params.id})`, 404)
    );
  }
  res.status(200).json({ status: 'success', data: { tour } });
});

exports.addNewTour = CatchAsyncErrors(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({ status: 'success', data: { tours: newTour } });
  // try {
  //   // const newTour = await new Tour(req.body);
  //   // newTour.save();
  //   const newTour = await Tour.create(req.body);
  //   res.status(201).json({ status: 'success', data: { tours: newTour } });
  // } catch (err) {
  //   console.log(`ERROR 💣 ${err}`);
  //   GlobalErrorHandlerController(err, req, res, next);
  // }
});

exports.updateTour = async (req, res, next) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedTour) {
      return next(
        new AppError(`Opps! No tour found with id (${req.params.id})`, 404)
      );
    }
    res.status(200).json({ status: 'success', data: updatedTour });
  } catch (err) {
    GlobalErrorHandlerController(err, req, res, next);
  }
};

exports.deleteTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      return next(
        new AppError(`Opps! No tour found with id (${req.params.id})`, 404)
      );
    }
    res.status(204).json({ status: 'success', message: 'Tour Deleted' });
  } catch (err) {
    GlobalErrorHandlerController(err, req, res, next);
  }
};

// Aggragation Pipeline: Mathching anf grouping data
// An aggregation pipeline consists of one or more stages that process documents:
// Each stage performs an operation on the input documents. For example, a stage can filter documents, group documents, and calculate values.
// The documents that are output from one stage are input to the next stage.
// An aggregation pipeline can return results for groups of documents. For example, return the total, average, maximum, and minimum values.
exports.getToursStats = async (req, res, next) => {
  try {
    const stats = await Tour.aggregate([
      // The $match stage: Filters the documents to those with a ratingsAverage greater than or equal to 4.5 then Outputs the filtered documents to the $group stage.
      // NB - You can chain multiple match methods to filter documents.
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numberTours: { $sum: 1 },
          totalRating: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalPrice: { $sum: '$price' },
        },
      },
      {
        $sort: {
          avgPrice: -1,
        },
      },
      // {
      //   $match: {
      //     _id: { $ne: `EASY` },
      //   },
      // },
    ]);

    res.status(200).json({ status: 'success', data: stats });
  } catch (err) {
    GlobalErrorHandlerController(err, req, res, next);
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = Number(req.params.year);
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numberOfTours: { $sum: 1 },
          // $push creates an array for the name
          tours: { $push: '$name' },
        },
      },
      {
        // addFields creates a new field in the document collection
        $addFields: { month: '$_id' },
      },
      {
        // Project makes the ID no longer show up \\ or hides the field from the collection
        $project: { _id: 0 },
      },
      {
        // Sorts by the highest to the lowest number of tours
        $sort: { numberOfTours: -1 },
      },
      {
        // Paginate the data in the document collection
        $limit: 12,
      },
    ]);
    res.status(200).json({ status: 'success', data: plan });
  } catch (err) {
    res.status(404).json({ status: 'error', message: err.message });
  }
};
