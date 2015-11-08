var child = require('child_process');
var http = require('http');
var test = require('tape');
var path = require('path');
var url = require('url');

var bin = require('../package.json').bin['amok'];

var browsers = (process.env['TEST_BROWSERS'] || 'chrome,chromium').split(',');

browsers.forEach(function (browser) {
  var port = 4000;
  var hostname = 'localhost';

  var args = [
    bin,
    '--browser',
    browser,
    '--debug-port',
    port,
    '--debug-host',
    hostname,
    url.resolve('file://', path.join('/' + __dirname, '/fixture/basic/index.html')),
  ];

  test(args.join(' '), function (test) {
    test.plan(2);

    var ps = child.spawn('node', args);
    ps.stderr.pipe(process.stderr);

    ps.on('close', function () {
      test.pass('close');
    });

    ps.stdout.setEncoding('utf-8');
    ps.stdout.once('data', function (data) {
      test.equal(data, 'ready\n');

      var request = http.get({
        port: port,
        hostname: hostname,
        path: '/json/version',
      });

      request.on('response', function(response) {
        var data = '';

        response.setEncoding('utf-8');
        response.on('data', function(chunk) {
          data += chunk;
        });

        response.on('end', function() {
          JSON.parse(data);
          ps.kill();
        });
      });
    });
  });
});
