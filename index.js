const fs = require('fs');
const CONFIG = require('./config');
const WebServer = require('./core/web-server');
const HTTPHandler = require('./handlers/http-handler');

if (!fs.existsSync(CONFIG.FILES)) {
  fs.mkdirSync(CONFIG.FILES);
}

const server = new WebServer(HTTPHandler);

server.run(CONFIG.PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${CONFIG.PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error(`uncaughtException:`, err.message, err.stack, err.errors);
  process.exit(255);
});

process.on('unhandledRejection', (reason, p) => {
  console.error(`Unhandled Rejection at: ${p}, reason: ${reason}`);
  process.exit(255);
});