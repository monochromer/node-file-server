const http = require('http');

class WebServer extends http.Server {
  constructor(HTTPHandler, ...args) {
    super(...args);
    this.HTTPHandler = HTTPHandler;
  }

  run(...args) {
    this
      .on('request', this.HTTPHandler)
      .on('error', error => {
        if (error.syscall !== 'listen') {
          throw error;
        }

        switch (error.code) {
          case 'EACCES':
            console.error('requires elevated privileges');
            process.exit(1);
            break;
          case 'EADDRINUSE':
            console.error('port is already in use');
            process.exit(1);
            break;
          default:
            throw error;
        }
      })
      .listen(...args);
  }
}

module.exports = WebServer;