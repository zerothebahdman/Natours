const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/TourRouter');
const userRouter = require('./routes/UserRouter');

const app = express();
// Node middleware
console.log(process.env.APP_ENV);
if (process.env.APP_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));
// app.use((req, res, next) => {
//   console.log('Hello from middleware');
//   next();
// });
// app.use((req, res, next) => {
//   req.time = new Date().toISOString();
//   next();
// });

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Handling Unhandled Routes.
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: `fail`,
    message: `404 ${req.originalUrl} not found on the server.`,
  });
});

// Implelmenting global error handling middleware.
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 500;

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

// app.get('/api/v1/tours', getAllTours);
// To make a variable in an endpoint nullable use the null operator in javascript (?) after the variable name e.g /:x?
// app.get('/api/v1/tours/:id/:x?', getIndividualTour);
// app.post('/api/v1/tours', addNewTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
module.exports = app;
