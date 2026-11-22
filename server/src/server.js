const app = require('./app');
const config = require('./config');
const db = require('./db');

const server = app.listen(config.port, () => {
  console.log('Nestora API running on port ' + config.port + ' (' + config.env + ')');
});

function shutdown(signal) {
  console.log(signal + ' received, shutting down');
  server.close(async () => {
    await db.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason instanceof Error ? reason.message : 'unknown');
});