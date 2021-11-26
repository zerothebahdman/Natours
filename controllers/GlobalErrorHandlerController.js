const AppError = require('../utils/AppError');

// This middleware handles errors that occur in the application
const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    error_stack: err.stack,
  });
};
//  Operational error, trusted error: send error to the client
const sendProductionError = (err, res) => {
  // Operational error that we trust: then send message to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Non Operational error or unknown error: dont leak error details

    // 1) Log the error
    console.error(`Error 💣:`, err);

    // 2) Send generic error message
    res.status(500).json({
      status: `Error`,
      message: `Something went wrong.`,
    });
  }
};
const handleDbCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateDbFields = (err) => {
  const value = err.keyValue.name;
  const message = `A tour already exists with this value: ${value}, Please change`;
  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';

  if (process.env.APP_ENV === 'development') {
    sendDevError(err, res);
  } else if (process.env.APP_ENV === 'production') {
    // let error = Object.assign(err);
    let error = { ...err };
    error.name = err.name;
    error.code = err.code;
    error.KeyValue = err.keyValue;

    if (error.name === `CastError`) {
      error = handleDbCastError(error);
    }

    if (error.code === 11000) error = handleDuplicateDbFields(error);
    sendProductionError(error, res);
  }
};
