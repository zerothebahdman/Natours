const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    error_stack: err.stack,
  });
};

const sendProductionError = (err, res) => {
  //  Operational error, trusted error: send error to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // programming or other unknown error: dont want to leak the details to the client
    //  1) log the error
    console.error('Error 💣', err);

    // 2) send generic message
    res.status(500).json({
      status: 'fail',
      message: `Internal server error`,
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 500;

  if (process.env.APP_ENV === 'development') {
    sendDevError(err, res);
  } else if (process.env.APP_ENV === 'production') {
    sendProductionError(err, res);
  }
  next();
};
