const path = require('path');

const ENV = process.env.NODE_ENV || 'production';

const BASE_CONFIG = {
  PORT: process.env.PORT || 3000,
  PUBLIC: path.join(process.cwd(), 'public'),
  FILES: path.join(process.cwd(), 'files'),
  LIMIT_FILE_SIZE: 1024 * 1024 * 2
}

const ENV_CONFIG = {
  'test': {
    PORT: process.env.PORT || 3001,
    FILES: path.join(process.cwd(), 'test', 'files'),
    FIXTURES: path.join(process.cwd(), 'test', 'fixtures'),
    LIMIT_FILE_SIZE: 1024 * 1024 * 1
  }
}

module.exports = Object.freeze({
  ...BASE_CONFIG,
  ...ENV_CONFIG[ENV]
});