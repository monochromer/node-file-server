const fs = require('fs');
const { promisify } = require('util');
const endWithStatus = require('../core/end-with-status');

function removeFile(filePath, res) {
  return promisify(fs.unlink)(filePath)
    .then(() => endWithStatus(200)(res))
    .catch(err => {
      if (err.code === 'ENOENT') {
        endWithStatus(404)(res);
        return;
      }

      endWithStatus(500)(res);
    });
}

module.exports = removeFile;