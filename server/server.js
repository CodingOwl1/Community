const app = require('./app');
const mongoose = require('mongoose');
const config = require('./config');

const connect = (url) => {
  return mongoose.connect(url, config.db.options).then(() => {
    console.log('Mongo Conneted')
  }).catch((error) => {
    console.log('Error', error)
  });
};

if (require.main === module) {
  app.listen(config.port);
  connect(config.db.prod);
  mongoose.connection.on('error', console.log);
}

module.exports = { connect };
