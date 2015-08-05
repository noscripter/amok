var amok = require('..');
var fs = require('fs');
var test = require('tape');
var url = require('url');
var path = require('path');

var browsers = [
  'chrome',
  'chromium',
];

browsers.forEach(function (browser, index) {
  var port = 4000 + index;

  test('watch events in ' + browser, function (assert) {
    var steps = {
      'ready': function (assert) {
        fs.writeFile('test/fixture/watch-events/file.txt', 'hello', 'utf-8', function (error) {
          assert.error(error);
        });
      },

      'add file.txt': function (assert) {
        fs.writeFile('test/fixture/watch-events/file.txt', 'hello world', 'utf-8', function (error) {
          assert.error(error);
        });
      },

      'change file.txt': function (assert) {
        fs.unlink('test/fixture/watch-events/file.txt', function (error) {
          assert.error(error);
        });
      },

      'unlink file.txt': function (assert) {
        assert.pass();
      },
    };

    var keys = Object.keys(steps);
    assert.plan(keys.length);

    var runner = amok.createRunner();
    assert.on('end', function () {
      runner.close();
    });

    runner.set('url', url.resolve('file://', path.join('/' + __dirname, '/fixture/watch-events/index.html')));

    runner.set('cwd', 'test/fixture/watch-events');
    runner.use(amok.browser(port, browser));
    runner.use(amok.watch('*.txt'));

    runner.connect(port, 'localhost', function () {
      runner.client.console.on('data', function (message) {
        if (!keys.length || !message.text.length) {
          return;
        }

        assert.equal(message.text, keys.shift(), message.text);

        var key = keys.shift();
        steps[key](assert);
        assert.equal(message.text, key, message.text);
      });

      runner.client.console.enable(function (error) {
        assert.error(error);
      });
    });
  });
});
