var amok = require('..');
var test = require('tape');
var url = require('url');
var path = require('path');

var commands = [
  'chrome',
  'chromium',
];

commands.forEach(function (command, index) {
  var port = 4000 + index;

  test('open url in ' + command, function (assert) {
    assert.plan(2);

    var runner = amok.createRunner();
    assert.on('end', function () {
      runner.close();
    });

    runner.set('url', url.resolve('file://', path.join('/' + __dirname, '/fixture/basic/index.html')));

    runner.use(amok.browser(port, command));
    runner.connect(port, 'localhost', function () {
      runner.client.console.on('data', function (message) {
        assert.equal(message.text, 'ready');
      });

      runner.client.console.enable(function (error) {
        assert.error(error);
      });
    });
  });
});
