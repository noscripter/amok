var amok = require('..');
var fs = require('fs');
var http = require('http');
var test = require('tape');
var url = require('url');
var path = require('path');

var browsers = [
  'chrome',
  'chromium',
];

browsers.forEach(function (browser, index) {
  var port = 4000 + index;

  test('hot patch basic script in ' + browser, function (assert) {
    assert.plan(34);

    var runner = amok.createRunner();
    assert.on('end', function () {
      runner.close();
    });

    runner.set('url', url.resolve('file://', path.join('/' + __dirname, '/fixture/hotpatch-basic/index.html')));

    runner.use(amok.browser(port, browser));
    runner.use(amok.hotpatch('test/fixture/hotpatch-basic/*.js'));

    runner.connect(port, 'localhost', function () {
      assert.pass('connect');

      var values = [
        'ready',
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

      var source = fs.readFileSync('test/fixture/hotpatch-basic/index.js', 'utf-8');

      runner.client.console.on('data', function (message) {
        assert.equal(message.text, values.shift(), message.text);
        if (values.length === 0) {
          return;
        }
       
        if (message.text.match(/step/)) {
          source = source.replace(message.text, values[0]);
          assert.notEqual(source, fs.readFileSync('test/fixture/hotpatch-basic/index.js'));

          fs.writeFile('test/fixture/hotpatch-basic/index.js', source, 'utf-8', function (error) {
            assert.error(error);
          });
        }
      });

      runner.client.console.enable(function (error) {
        assert.error(error);
      });
    });
  });
});

browsers.forEach(function (browser, index) {
  var port = 4000 + index;

  test('hot patch events in ' + browser, function (assert) {
    assert.plan(6);

    var runner = amok.createRunner();
    runner.on('close', function () {
      assert.pass('close');
    });

    runner.set('cwd', 'test/fixture/hotpatch-events');
    runner.set('url', url.resolve('file://', path.join('/' + __dirname, '/fixture/hotpatch-events/index.html')));

    runner.use(amok.browser(port, browser));
    runner.use(amok.hotpatch('test/fixture/hotpatch-events/*.js'));

    runner.connect(port, 'localhost', function () {
      assert.pass('connect');

      var values = [
        'ready',
        'patch index.js',
      ];

      runner.client.console.on('data', function (message) {

        assert.equal(message.text, values.shift());

        if (values[0] === undefined) {
          runner.close();
        } else if (message.text.match(/ready/)) {
          var source = fs.readFileSync('test/fixture/hotpatch-events/index.js', 'utf-8');
          setTimeout(function () {
            fs.writeFile('test/fixture/hotpatch-events/index.js', source, 'utf-8', function (error) {
              assert.error(error);
            });
          }, 1000);
        }
      });

      runner.client.console.enable(function (error) {
        assert.error(error);
      });
    });
  });
});
