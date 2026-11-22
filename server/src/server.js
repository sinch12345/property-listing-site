const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log('Nestora API running on port ' + config.port + ' (' + config.env + ')');
});

server.on('error', (err) => {
  console.error('Server error: ' + err.message);
  process.exit(1);
});