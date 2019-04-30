const fs = require('fs');
const mime = require('mime');
const endWithStatus = require('../core/end-with-status');

function sendFile(filepath, res) {
  let fileStream = fs.createReadStream(filepath);

  // обрыв соединения
  res.on('close', () => {
    fileStream.destroy();
  });

  fileStream
    .on('error', err => {
      switch (true) {
        case (err.code === 'ENOENT'):
          endWithStatus(404)(res);
          break;
        case (!res.headersSent):
          endWithStatus(500)(res);
          break;
        default:
          res.end();
      }
    })
    .on('open', () => {
      const contentType = mime.getType(filepath);
      res.setHeader('Content-Type', contentType);
    })
    .pipe(res);
};

module.exports = sendFile;