const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/config.env` });
const app = require('./app');

const port = process.env.APP_PORT || 8000;
app.listen(port, () => {
  console.log(`App is running on port ${port}....`);
});
