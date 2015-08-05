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
    var steps = Array.apply(0, Array(10)).map(function (value, index) {
      return 'step-' + index;
    });
    steps.push('step-0');

    assert.plan(steps.length * 2 + 1);

    var runner = amok.createRunner();
    assert.on('end', function () {
      runner.close();
    });

    runner.set('url', url.resolve('file://', path.join('/' + __dirname, '/fixture/hotpatch-basic/index.html')));

    runner.use(amok.browser(port, browser));
    runner.use(amok.hotpatch('test/fixture/hotpatch-basic/*.js'));

    runner.connect(port, 'localhost', function () {
      var source = fs.readFileSync('test/fixture/hotpatch-basic/index.js', 'utf-8');

      runner.client.console.on('data', function (message) {
        if (!steps.length || !message.text.match(/^step/)) {
          return;
        }

        assert.equal(message.text, steps.shift(), message.text);

        source = source.replace(message.text, steps[0] || 'step-0');
        fs.writeFile('test/fixture/hotpatch-basic/index.js', source, 'utf-8', function (error) {
          assert.error(error);
        });
      });

      runner.client.console.enable(function (error) {
        assert.error(error);
      });
    });
  });
});