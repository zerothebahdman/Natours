const AppError = require('../utils/AppErrorClass');
const CatchAsyncErrorClass = require('../utils/CatchAsyncErrorClass');

// A factory function is any function which is not a class or constructor that returns a (presumably new) object. In JavaScript, any function can return an object. When it does so without the new keyword, it’s a factory function.

exports.deleteDocument = (Model) => async (req, res, next) => {
  try {
    if (req.params.tourId) req.params.id = req.params.tourId;
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(
        new AppError(`Opps! No document found with id (${req.params.id})`, 404)
      );
    }
    res.status(204).json({ status: 'success', message: 'Document Deleted' });
  } catch (err) {
    return next(new AppError(err.message, err.status));
  }
};

exports.updateDocument = (Model) => async (req, res, next) => {
  try {
    if (req.params.tourId) req.params.id = req.params.tourId;
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!document) {
      return next(
        new AppError(`Opps! No document found with id (${req.params.id})`, 404)
      );
    }
    res.status(200).json({ status: 'success', data: document });
  } catch (err) {
    return next(new AppError(err.message, err.status));
  }
};

exports.addNewDoc = (Model) =>
  CatchAsyncErrorClass(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(201).json({ status: 'success', data: document });
  });
