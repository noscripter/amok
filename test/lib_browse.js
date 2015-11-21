var amok = require('..');
var net = require('net');
var test = require('tape');
var url = require('url');
var path = require('path');

var browsers = (process.env['TEST_BROWSERS'] || 'chrome,chromium').split(',');

browsers.forEach(function (browser, index) {
  var port = 4000 + index;

  var entries = [
    'test/fixture/basic/index.html',
    path.resolve('test/fixture/basic/index.html'),
    url.resolve('file://', path.resolve('test/fixture/basic/index.html'))
  ];

  entries.forEach(function(entry) {
    test('open url (' + entry + ') in ' + browser, function (test) {
      test.plan(3);

      var runner = amok.createRunner();
      runner.on('close', function () {
        test.pass('close');
      });

      runner.set('url', entry);

      runner.use(amok.browse(port, browser));
      runner.connect(port, 'localhost', function () {
        runner.client.console.on('data', function (message) {
          test.equal(message.text, 'ready');

          setTimeout(function () {
            runner.close();
          }, 100);
        });

        runner.client.console.enable(function (error) {
          test.error(error);
        });
      });
    });
  });
});

browsers.forEach(function (browser, index) {
  var port = 4000 + index;

  test('error when port is used in ' + browser, function (test) {
    test.plan(2);
    test.timeoutAfter(5000);

    var server = net.createServer();
    server.on('close', function() {
      test.pass();
    });

    server.on('listening', function() {
      var runner = amok.createRunner();
      server.on('close', function () {
        runner.close();
      });

      runner.set('url', url.resolve('file://', path.join('/' + __dirname, '/fixture/basic/index.html')));
      runner.use(amok.browse(port, browser));

      runner.on('error', function(error) {
        test.equal(error.code, 'EADDRINUSE');
        server.close();
      });

      runner.connect(port, 'localhost');
    });

    server.listen(port);
  });
});
