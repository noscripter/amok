'use strict';

const fs = require('fs');
const http = require('http');
const mime = require('mime');
const path = require('path');
const url = require('url');
const util = require('util');

const debug = util.debuglog('amok-serve');

function serve(port, host) {
  function serve(client, runner, done) {
    let server = http.createServer();

    server.once('error', error => {
      done(error);
    });

    server.once('listening', () => {
      server.removeListener('error', done);

      runner.server = server;
      runner.set('url', url.format({
        protocol: 'http',
        port: port,
        hostname: host,
        pathname: '/'
      }));

      done();
    });

    server.on('request', (request, response) => {
      debug('handle %s', request.url);

      let pathname = url.parse(request.url).pathname;
      if (pathname === '/') {
        pathname = '/index.html';
      }

      let scripts = runner.get('scripts') || {};
      let cwd = runner.get('cwd') || process.cwd();
      let filename = scripts[path.normalize(pathname.slice(1))] || path.normalize(pathname.slice(1));

      if (!path.isAbsolute(filename)) {
        filename = path.join(cwd, filename);
      }

      fs.stat(filename, (error, stat) => {
        response.setHeader('content-type', mime.lookup(filename));

        if (error) {
          if (pathname === '/index.html') {
            debug('generate index.html');

            response.write('<!DOCTYPE html><html><head>');
            response.write('<title>' + path.basename(cwd) + '</title>');
            response.write('</head><body>');

            if (scripts) {
              Object.keys(scripts).forEach(src => {
                response.write('<script src="' + src + '"></script>');
              });
            }

            return response.end('</body></html>');
          } else if (pathname === '/favicon.ico') {
            debug('generate favicon.ico');
            return response.end();
          } else {
            debug('404 %s', pathname);
            response.statusCode = 404;
            return response.end('404');
          }
        }

        if (stat.isFile()) {
          debug('stream %s', filename);
          fs.createReadStream(filename).pipe(response);
        } else {
          debug('403 %s', pathname);
          response.statusCode = 403;
          return response.end('403');
        }
      });
    });

    server.listen(port, host);
  }

  serve.close = function close(runner, done) {
    let server = runner.server;
    if (server) {
      server.once('close', done);
      return server.close();
    }

    done();
  };

  return serve;
}

module.exports = serve;
