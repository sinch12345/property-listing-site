const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log('Nestora API running on port ' + config.port + ' (' + config.env + ')');
});