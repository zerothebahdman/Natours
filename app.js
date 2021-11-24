const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/TourRouter');
const userRouter = require('./routes/UserRouter');
const AppError = require('./utils/AppError');
const GlobalErrorHandler = require('./controllers/GlobalErrorHandlerController');

const app = express();
// Node middleware
//console.log(process.env.APP_ENV);
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
  // res.status(404).json({
  //   status: `fail`,
  //   message: `404 ${req.originalUrl} not found on the server.`,
  // });
  next(new AppError(`Cant find ${req.originalUrl} on the server.`, 404));
});

// Implelmenting global error handling middleware.
app.use(GlobalErrorHandler);

// app.get('/api/v1/tours', getAllTours);
// To make a variable in an endpoint nullable use the null operator in javascript (?) after the variable name e.g /:x?
// app.get('/api/v1/tours/:id/:x?', getIndividualTour);
// app.post('/api/v1/tours', addNewTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
module.exports = app;
