'use strict';

const http = require('http');
const rdbg = require('rdbg');
const url = require('url');
const util = require('util');

function inspect(port, host) {
  return function inspect(client, runner, callback) {
    rdbg.get(port, host, (error, targets) => {
      if (error) {
        callback(error);
      }

      let target = targets.find(target => {
        return runner.get('url') === url.format(url.parse(target.url));
      });

      let path = url.format({
        protocol: 'http',
        port: port,
        hostname: host,
        path: '/json/new?'
      }) + target.devtoolsFrontendUrl;

      let request = http.get({
        port: port,
        host: host,
        path: '/json/new?' + path,
      });

      request.on('error', error => {
        callback(error);
      });

      request.on('response', response => {
        request.removeListener('error', callback);
        callback();
      });
    });
  };
}

module.exports = inspect;
