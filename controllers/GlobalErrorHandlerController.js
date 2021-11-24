module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 500;

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
  next();
};
