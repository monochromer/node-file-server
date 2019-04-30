const path = require('path');
const http = require('http');
const assert = require('assert');
const request = require('request');
const fse = require('fs-extra');

const CONFIG = require('../config');
const WebServer = require('../core/web-server');
const HTTPHandler = require('../handlers/http-handler');

const server = new WebServer(HTTPHandler);

const BASE_URL = `http://localhost:${CONFIG.PORT}`;

describe('server tests', () => {
  before(done => {
    fse.mkdirpSync(CONFIG.FILES);
    fse.emptyDirSync(CONFIG.FILES);
    server.run(CONFIG.PORT, () => done());
  });

  after(done => {
    fse.removeSync(CONFIG.FILES);
    server.close(() => done());
  });

  beforeEach(() => {
    fse.emptyDirSync(CONFIG.FILES);
  });

  it('NODE_ENV should be `test`', () => {
    assert.strictEqual(process.env.NODE_ENV, 'test');
  });

  describe('GET', () => {
    it('returns 200 & the file', done => {
      const fileName = 'index.html';
      fse.copyFileSync(
        path.join(CONFIG.FIXTURES, 'index.html'),
        path.join(CONFIG.FILES, 'index.html'),
      );

      const content = fse.readFileSync(path.join(CONFIG.FILES, fileName));

      request.get(`${BASE_URL}/${fileName}`, (err, response, body) => {
        if (err) return done(err);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.headers['content-type'], 'text/html');
        assert.strictEqual(body, content.toString('utf-8'));
        done();
      });
    });

    it('should return 404', done => {
      request.get(`${BASE_URL}/not_exists.png`, (error, response, body) => {
        if (error) return done(error);

        assert.strictEqual(response.statusCode, 404);
        assert.strictEqual(body, http.STATUS_CODES[404]);
        done();
      });
    });
  });

  describe('POST', () => {
    it('returns 409 & file not modified', done => {
      const fileName = 'index.html';

      fse.copyFileSync(
        path.join(CONFIG.FIXTURES, fileName),
        path.join(CONFIG.FILES, fileName),
      );

      const mtime = fse.statSync(path.join(CONFIG.FILES, fileName)).mtime;
      const req = request.post(`${BASE_URL}/${fileName}`, (error, response, body) => {
        if (error) return done(error);

        const newMtime = fse.statSync(path.join(CONFIG.FILES, fileName)).mtime;

        assert.deepStrictEqual(mtime, newMtime);
        assert.strictEqual(response.statusCode, 409);
        assert.strictEqual(body, http.STATUS_CODES[409]);
        done();
      });

      fse.createReadStream(path.join(CONFIG.FIXTURES, fileName)).pipe(req);
    });

    it('returns 409 when zero file size', done => {
      const fileName = 'index.html';

      fse.copyFileSync(
        path.join(CONFIG.FIXTURES, fileName),
        path.join(CONFIG.FILES, fileName),
      );

      const mtime = fse.statSync(path.join(CONFIG.FILES, fileName)).mtime;

      const req = request.post(`${BASE_URL}/${fileName}`, (error, response, body) => {
        if (error) return done(error);

        const newMtime = fse.statSync(path.join(CONFIG.FILES, fileName)).mtime;

        assert.deepStrictEqual(mtime, newMtime);
        assert.strictEqual(response.statusCode, 409);
        assert.strictEqual(body, http.STATUS_CODES[409]);
        done();
      });

      req.end();
    });

    it('should handle big files', done => {
      const fileName = 'big.jpg';

      const req = http.request(`${BASE_URL}/${fileName}`, {
        method: 'POST',
      }, (response) => {
        assert.strictEqual(response.statusCode, 413);
        assert.strictEqual(response.headers['connection'], 'close');

        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => { body += chunk; });
        response.on('end', () => {
          assert.strictEqual(body, 'File is too big');

          assert.strictEqual(
            fse.existsSync(path.join(CONFIG.FILES, fileName)),
            false
          );

          done();
        });
      });

      req.on('error', error => {
        // EPIPE error should occur because we try to pipe after res closed
        if (error.code !== 'EPIPE' && error.code !== 'ECONNRESET') {
          done(error);
        };
      });

      fse.createReadStream(path.join(CONFIG.FIXTURES, fileName))
        .pipe(req);
    });

    it('should create file', done => {
      const fileName = 'small.jpg';

      const req = request.post(`${BASE_URL}/${fileName}`, (error, response, body) => {
        if (error) return done(error);

        assert.strictEqual(response.statusCode, 201);
        assert.strictEqual(body, http.STATUS_CODES[201]);

        assert.ok(fse.existsSync(path.join(CONFIG.FILES, fileName)));
        done();
      });

      fse.createReadStream(path.join(CONFIG.FIXTURES, fileName))
        .pipe(req);
    });

    it('should handle terminated request', done => {
      const fileName = 'example.txt';

      const req = http.request(`${BASE_URL}/${fileName}`, {
        method: 'POST'
      });

      req.on('error', err => {
        if (err.code !== 'ECONNRESET') return done(err);

        assert.strictEqual(
          fse.existsSync(path.join(CONFIG.FILES, fileName)),
          false
        );
        done();
      });

      req.write('content');

      setTimeout(() => {
        req.abort();
      }, 300);
    });
  });

  describe('DELETE', () => {
    it('should remove file', done => {
      const fileName = 'index.html';

      fse.copyFileSync(
        path.join(CONFIG.FIXTURES, fileName),
        path.join(CONFIG.FILES, fileName),
      );

      request.delete(`${BASE_URL}/${fileName}`, (error, response, body) => {
        if (error) return done(error);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(body, http.STATUS_CODES[200]);

        assert.strictEqual(
          fse.existsSync(path.join(CONFIG.FILES, fileName)),
          false
        );

        done();
      });
    });

    it('should return 404', done => {
      const fileName = 'index.html';

      request.delete(`${BASE_URL}/${fileName}`, (error, response, body) => {
        if (error) return done(error);

        assert.strictEqual(response.statusCode, 404);
        assert.strictEqual(body, http.STATUS_CODES[404]);
        done();
      });
    });
  });
});
