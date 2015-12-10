var amok = require('..');
var path = require('path');
var stream = require('stream');
var test = require('tape');
var url = require('url');

const browser = process.env['TEST_BROWSER'];
const port = process.env['TEST_PORT'] || 4000;

test(`print in ${browser}`, assert => {
    assert.plan(2);

    runner.set('url', 'test/fixture/basic/index.html');
    var output = new stream.Writable();
    output._write = function (chunk, encoding, callback) {
      test.assert(chunk, 'ready\n');

      var runner = amok.createRunner();
      runner.on('close', function () {
        test.pass('close');
      });

      runner.close();
    };

    runner.use(amok.browse(port, browser));
    runner.use(amok.print(output));

    runner.connect(port);
  });
});
