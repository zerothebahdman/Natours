const mongoose = require('mongoose');
const dotenv = require('dotenv');

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

const port = process.env.APP_PORT || 8000;
app.listen(port, () => {
  console.log(`App is running on port ${port}....`);
});
