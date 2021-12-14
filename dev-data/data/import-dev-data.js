const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../src/models/Tour');
const User = require('../../src/models/User');
const Review = require('../../src/models/Reviews');

dotenv.config({ path: `${__dirname}/.env` });

const db =
  'mongodb+srv://divine:hEqomIoOVQGGKnWv@cluster0.yksko.mongodb.net/Natours?retryWrites=true&w=majority';
mongoose
  //.connect(process.env.DEV_DB) to connect to dev database.
  .connect(db)
  .then(() => {
    console.log(`App connected to database successfully`);
  })
  .catch((err) => {
    console.log(err);
  });

//   Read Json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf8')
);

//import data into db
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Imported successfully');
  } catch (err) {
    console.log(err.message);
  }
  process.exit();
};
//Delete all data on database

const deleteAllData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('All data deleted successfully');
  } catch (err) {
    console.log(err.message);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteAllData();
}
console.log(process.argv);
