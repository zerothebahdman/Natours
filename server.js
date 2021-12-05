const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(`Unhandled Exception💣! Shutdown In Progress...`);
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: `${__dirname}/.env` });
const app = require('./app');

const db = process.env.ATLAS_DB.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose
  //.connect(process.env.DEV_DB) to connect to dev database.
  .connect(db)
  .then(() => {
    console.log(`App connected to database successfully`);
  })
  .catch((err) => {
    console.log(err);
  });

console.log(`This application is currently running on ${process.env.APP_ENV}`);
const port = process.env.APP_PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App is running on port ${port}....`);
});

process.on('unhandledRejection', (err) => {
  console.log(`Unhandled Rejection!!💣 Shutdown In Progress`);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
