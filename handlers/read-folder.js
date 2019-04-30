const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

function getFileStat(filePath) {
  return promisify(fs.stat)(filePath)
}

function getFilesStat(files, rootFolderPath) {
  return files.map(async (name) => {
    const filePath = path.join(rootFolderPath, name);
    const fsStat = await getFileStat(filePath);
    return {
      name,
      size: fsStat.size,
      mtime: fsStat.mtime,
      isDirectory: fsStat.isDirectory()
    }
  })
}

function readFolder(folderPath) {
  return promisify(fs.readdir)(folderPath)
    .then(files => Promise.all(getFilesStat(files, folderPath)))
}

module.exports = readFolder;