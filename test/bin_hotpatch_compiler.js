var child = require('child_process');
var http = require('http');
var test = require('tape');
var fs = require('fs');
var path = require('path');
var url = require('url');
var sculpt = require('sculpt');

var bin = require('../package.json').bin['amok'];

var browsers = [
  'chrome',
  'chromium',
];

var compilers = [
// 'babel',
  'coffee',
  'tsc',
  'watchify',
  'webpack',
];

browsers.forEach(function (browser) {
  compilers.forEach(function (compiler, index) {
    var dirname = 'test/fixture/hotpatch-' + compiler;
    var entries = fs.readdirSync(dirname).map(function (filename) {
      return path.join(dirname, filename);
    }).filter(function (filename) {
      return filename.match(/(.js|.ts|.coffee)$/);
    });

    var args = [
      bin,
      '--hot',
      '--compiler',
      compiler,
      '--browser',
      browser,
      entries[0]
    ];

    test(args.join(' '), function (assert) {
      var steps = Array.apply(0, Array(10)).map(function (value, index) {
        return 'step-' + index;
      });
      steps.push('step-0');

      assert.plan(steps.length * 2);

      var ps = child.spawn('node', args);
      ps.stderr.pipe(process.stderr);

      assert.on('end', function () {
        ps.kill();
      });

      var source = fs.readFileSync(entries[0], 'utf-8');
      ps.stdout.setEncoding('utf-8');
      ps.stdout.pipe(sculpt.split(/\r?\n/)).on('data', function (line) {
        if (!steps.length || !line.match(/^step/)) {
          return;
        }

        assert.equal(line, steps.shift(), line);

        source = source.replace(line, steps[0] || 'step-0');
        setTimeout(function () {
          fs.writeFile(entries[0], source, 'utf-8', function (error) {
            assert.error(error);
          });
        }, 1000);
      });
    });
  });
});