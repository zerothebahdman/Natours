const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');

const app = express();
// Node middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use((req, res, next) => {
  console.log('Hello from middleware');
  next();
});
app.use((req, res, next) => {
  req.time = new Date().toISOString();
  next();
});

// Users Endpoint

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// app.get('/api/v1/tours', getAllTours);
// To make a variable in an endpoint nullable use the null operator in javascript (?) after the variable name e.g /:x?
// app.get('/api/v1/tours/:id/:x?', getIndividualTour);
// app.post('/api/v1/tours', addNewTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
module.exports = app;
