var amok = require('..');
var fs = require('fs');
var http = require('http');
var path = require('path');
var test = require('tape');
var url = require('url');

var browsers = (process.env['TEST_BROWSERS'] || 'chrome,chromium').split(',');


browsers.forEach(function (browser, index) {
  var port = 4000 + index;

  test('hot patch basic script in ' + browser, function (test) {
    test.plan(24);

    var runner = amok.createRunner();
    runner.on('close', function () {
      test.pass('close');
    });

    runner.set('url', url.resolve('file://', path.join('/' + __dirname, '/fixture/hotpatch/index.html')));

    runner.use(amok.browser(port, browser));
    runner.use(amok.hotpatch('test/fixture/hotpatch/*.js'));

    runner.connect(port, 'localhost', function () {
      test.pass('connect');

      var values = [
        'step-0',
        'step-1',
        'step-2',
        'step-3',
        'step-4',
        'step-5',
        'step-6',
        'step-7',
        'step-8',
        'step-9',
        'step-0',
      ];

      var source = fs.readFileSync('test/fixture/hotpatch/index.js', 'utf-8');

      runner.client.console.on('data', function (message) {
        test.equal(message.text, values.shift(), message.text);

        if (values[0] === undefined) {
          runner.close();
        } else if (message.text.match(/step/)) {
          source = source.replace(message.text, values[0]);
          test.notEqual(source, fs.readFileSync('test/fixture/hotpatch/index.js'));

          fs.writeFileSync('test/fixture/hotpatch/index.js', source, 'utf-8');
        }
      });

      runner.client.console.enable(function (error) {
        test.error(error);
      });
    });
  });
});
