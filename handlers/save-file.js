const fs = require('fs');
const CONFIG = require('../config');
const endWithStatus = require('../core/end-with-status');
const LimitSizeStream = require('../core/limit-size-stream');

function saveFile(filePath, req, res) {
  // non-streaming client
  if (req.headers['content-length'] > CONFIG.LIMIT_FILE_SIZE) {
    res.statusCode = 413;
    res.setHeader('Connection', 'close');
    res.end('File is too big');
    return;
  }

  const writeStream = new fs.WriteStream(filePath, { flags: 'wx' });
  // wx - бросить исключение, если файл есть
  const limitStream = new LimitSizeStream({
    limit: CONFIG.LIMIT_FILE_SIZE
  });

  req
    .pipe(limitStream)
    .pipe(writeStream);

  limitStream.on('error', err => {
    if (err.code === 'LIMIT_EXCEEDED') {
      res.statusCode = 413;
      res.setHeader('Connection', 'close');
      res.end('File is too big');
      fs.unlink(filePath, err => {});
      return;
    }

    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Connection', 'close');
      res.end('Internal server error');
    } else {
      res.end();
    }

    fs.unlink(filePath, err => {});
  });

  req
    .on('close', () => {
      if (res.finished) return;
      writeStream.destroy();
      fs.unlink(filePath, err => {});
    })

  writeStream
    .on('error', err => {
      if (err.code === 'EEXIST') {
        return endWithStatus(409)(res);
      }

      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Connection', 'close');
        res.end('Internal server error');
      } else {
        res.end();
      }

      fs.unlink(filepath, err => {});
    })
    .on('close', () => {
      // Note: can't use on('finish')
      // finish = data flushed, for zero files happens immediately,
      // even before 'file exists' check

      // for zero files the event sequence may be:
      //   finish -> error

      // we must use 'close' event to track if the file has really been written down
      endWithStatus(201)(res);
    });
};


module.exports = saveFile;