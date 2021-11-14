const fs = require('fs');
const express = require('express');

const app = express();
app.use(express.json());
// app.get('/', (req, res) => {
//   res.status(200).send('Hello from the server!');
// });
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);
getAllTours = (req, res) => {
  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } });
};

getIndividualTour = (req, res) => {
  console.log(req.params);
  let id = Number(req.params.id);
  const tour = tours.find((tour) => tour.id === id);
  if (!tour) {
    return res.status(404).json({ status: 'error', message: 'Invalid ID' });
  }
  res.status(200).json({ status: 'success', data: { tour } });
};

addNewTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({ status: 'success', data: { tours: newTour } });
    }
  );
};

updateTour = (req, res) => {
  if (Number(req.params.id) > tours.length) {
    return res.status(404).json({ status: 'error', message: 'Invalid ID' });
  }

  res.status(200).json({ status: 'success', data: 'Expected Tour' });
};

deleteTour = (req, res) => {
  if (Number(req.params.id) > tours.length) {
    return res.status(404).json({ status: 'error', message: 'Invalid ID' });
  }

  res.status(204).json({ status: 'success', message: 'Tour Deleted' });
};

app.route('/api/v1/tours').get(getAllTours).post(addNewTour);
app
  .route('/api/v1/tours/:id')
  .patch(updateTour)
  .delete(deleteTour)
  .get(getIndividualTour);
// app.get('/api/v1/tours', getAllTours);
// To make a variable in an endpoint nullable use the null operator in javascript (?) after the variable name e.g /:x?
// app.get('/api/v1/tours/:id/:x?', getIndividualTour);
// app.post('/api/v1/tours', addNewTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

const port = 8000;
app.listen(port, () => {
  console.log(`App is running on port ${port}....`);
});
