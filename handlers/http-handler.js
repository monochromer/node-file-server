const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const url = require('url');

const CONFIG = require('../config');
const endWithStatus = require('../core/end-with-status');
const readFolder = require('./read-folder');
const sendFile = require('./send-file');
const saveFile = require('./save-file');
const removeFile = require('./remove-file');
const fileListTemplate = require('../templates/file-list');

async function onRequest(req, res) {
  const parsedURL = url.parse(req.url, true);
  const viewType = (parsedURL.query && parsedURL.query.view)
    ? decodeURIComponent(parsedURL.query.view)
    : null;
  let pathname = decodeURIComponent(parsedURL.pathname);

   if (pathname.indexOf('\0') !== -1) {
    return endWithStatus(400)(res);
  }

  const ROOT_PATH = path.resolve(CONFIG.FILES);
  const LOCAL_PATH = pathname;
  pathname = path.normalize(path.join(ROOT_PATH, pathname));

  if (pathname.indexOf(ROOT_PATH) !== 0) {
    return endWithStatus(403)(res);
  }

  switch (req.method) {
    case 'GET':
      promisify(fs.stat)(pathname)
        .then(fsStat => {
          if (fsStat.isDirectory()) {
            readFolder(pathname)
              .then(tree => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                fileListTemplate(LOCAL_PATH, LOCAL_PATH, tree, viewType)
                  .pipe(res);
              })
              .catch((err) => {
                endWithStatus(404)(res)
              })
          } else {
            sendFile(pathname, res);
          }
        })
        .catch(error => {
          error.code === 'ENOENT'
            ? endWithStatus(404)(res)
            : endWithStatus(500)(res)
        });
      break;
    case 'POST':
      if (!pathname) {
        return endWithStatus(404);
      }
      saveFile(pathname, req, res);
      break;
    case 'DELETE':
      if (!pathname) {
        return endWithStatus(404);
      }
      removeFile(pathname, res);
      break;
    default:
      endWithStatus(501)(res);
      break;
  }
}

module.exports = onRequest