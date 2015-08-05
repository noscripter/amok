var amok = require('..');
var test = require('tape');
var fs = require('fs');
var path = require('path');

var browsers = [
  'chrome',
  'chromium',
];

browsers.forEach(function (browser, index) {
  var port = 4000 + index;
  var compilers = [
  // 'babel',
    'coffee',
    'tsc',
    'watchify',
    'webpack',
  ];

  compilers.forEach(function (compiler) {
    test('hot patch basic script compiled with ' + compiler + ' in ' + browser, function (assert) {
      var steps = Array.apply(0, Array(10)).map(function (value, index) {
        return 'step-' + index;
      });
      steps.push('step-0');

      assert.plan(steps.length * 2 + 1);

      var dirname = 'test/fixture/hotpatch-' + compiler;
      var entries = fs.readdirSync(dirname).map(function (filename) {
        return path.join(dirname, filename);
      }).filter(function (filename) {
        return filename.match(/(.js|.ts|.coffee)$/);
      });

      var runner = amok.createRunner();
      assert.on('end', function () {
        runner.close();
      });

      runner.use(amok.server(9966, 'localhost'));
      runner.use(amok.compiler(compiler, entries, {
        stdio: 'inherit'
      }));

      runner.use(amok.browser(port, browser));
      runner.use(amok.hotpatch());

      runner.connect(port, 'localhost', function () {
        var source = fs.readFileSync(entries[0], 'utf-8');

        runner.client.console.on('data', function (message) {
          if (!steps.length || !message.text.match(/^step/)) {
            return;
          }

          assert.equal(message.text, steps.shift(), message.text);

          setTimeout(function () {
            source = source.replace(message.text, steps[0] || 'step-0');
            fs.writeFile(entries[0], source, 'utf-8', function (error) {
              assert.error(error);
            });
          }, 1000);
        });

        runner.client.console.enable(function (error) {
          assert.error(error);
        });
      });
    });
  });
});