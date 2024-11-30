/* eslint-disable no-undef */
const app = require('./app');

const mongoose = require('mongoose');

require('dotenv').config();

const PORT = process.env.PORT;
const uriDB = process.env.MONGO_URI || 'mongodb://localhost:27017/healthDB';

const connection = mongoose.connect(uriDB);

connection
  .then(() => {
    app.listen(PORT, () => {
      console.log('Server running. Use our API on port:', PORT);
    });
  })
  .catch((err) => {
    console.log(`Server not running. Error message: ${err.message}`);
    process.exit(1);
  });
