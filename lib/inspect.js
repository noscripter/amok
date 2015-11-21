var http = require('http');
var rdbg = require('rdbg');
var url = require('url');
var util = require('util');

function inspect(port, host) {
  return function inspect(client, runner, callback) {
    rdbg.get(port, host, function (error, targets) {
      if (error) {
        callback(error);
      }

      var matches = targets.filter(function (target) {
        return runner.get('url') === url.format(url.parse(target.url));
      });

      var path = url.format({
        protocol: 'http',
        port: port,
        hostname: host,
        path: '/json/new?'
      }) + matches[0].devtoolsFrontendUrl;

      var request = http.get({
        port: port,
        host: host,
        path: '/json/new?' + path,
      });

      request.on('error', function(error) {
        callback(error);
      });

      request.on('response', function(response) {
        callback();
      });
    });
  };
}

module.exports = inspect;
