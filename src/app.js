const express = require('express');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitizer = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const ReviewRouter = require('./routes/ReviewRouter');
const tourRouter = require('./routes/TourRouter');
const userRouter = require('./routes/UserRouter');
const AppError = require('./utils/AppErrorClass');
const GlobalErrorHandler = require('./middleware/GlobalErrorHandlerMiddleware');

const app = express();
// Node middleware

// Middleware that sets HTTP headers
app.use(helmet());

// Middleware that logs development endpoints
if (process.env.APP_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limit middleware
const limiter = rateLimit({
  // Number of request
  max: 100,
  // Number of seconds between requests
  windowMs: 60 * 60 * 1000, // 1 hour
  message: `Too many request from this IP, Try again in a 1 hour`,
});
app.use('/api', limiter);

// Middleware that performs body Parsering, reading data from the request body and storing it in req.body
app.use(express.json());

// Middleware that performs data sanitization againt NoSQL query injection
app.use(mongoSanitizer());

// Middleware that performs data sanitization againts XXS
app.use(xss());

// Middleware that prevents parameter polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
); //whitelist will allow us use duplicate parameters for the specified fields

// Middleware that serves static files
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
app.use('/api/v1/reviews', ReviewRouter);

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
