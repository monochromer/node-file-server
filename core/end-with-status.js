const http = require('http');

function endWithStatus(code, message = http.STATUS_CODES[code]) {
  return function(res) {
    res.statusCode = code;
    res.end(`${message}`);
  }
}

module.exports = endWithStatus;