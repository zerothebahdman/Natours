const AppError = require('../utils/AppErrorClass');

// A factory functions are functions that returns a new object,

exports.deleteOne = (Model) => async (req, res, next) => {
  try {
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
