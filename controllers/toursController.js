const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkId = (req, res, next, value) => {
  console.log(`Tour id is: ${value}`);
  if (Number(req.params.id) > tours.length) {
    return res.status(404).json({ status: 'error', message: 'Invalid ID' });
  }
};

exports.checkBody = (req, res, next) => {
  if (req.body.name === undefined && req.body.price === undefined) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Name and Price cannot be empty' });
  }
  next();
};

exports.getAllTours = (req, res) => {
  console.log(req.time);
  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } });
};

exports.getTour = (req, res) => {
  console.log(req.params);
  let id = Number(req.params.id);
  const tour = tours.find((tour) => tour.id === id);

  res.status(200).json({ status: 'success', data: { tour } });
};

exports.addNewTour = (req, res) => {
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

exports.updateTour = (req, res) => {
  res.status(200).json({ status: 'success', data: 'Expected Tour' });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({ status: 'success', message: 'Tour Deleted' });
};
