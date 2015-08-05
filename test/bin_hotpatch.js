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

browsers.forEach(function (browser) {
  var entries = [
    'test/fixture/hotpatch-basic/index.js',
    url.resolve('file://', path.join('/' + __dirname, '/fixture/hotpatch-basic/index.html'))
  ];

  entries.forEach(function (entry) {
    var args = [
      bin,
      '--hot',
      '--browser',
      browser,
      entry
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

      var source = fs.readFileSync('test/fixture/hotpatch-basic/index.js', 'utf-8');
      ps.stdout.setEncoding('utf-8');
      ps.stdout.pipe(sculpt.split(/\r?\n/)).on('data', function (line) {
        if (!steps.length || !line.match(/^step/)) {
          return;
        }

        assert.equal(steps.shift(), line, line);

        setTimeout(function () {
          source = source.replace(line, steps[0] || 'step-0');
          fs.writeFile('test/fixture/hotpatch-basic/index.js', source, 'utf-8', function (error) {
            assert.error(error);
          });
        }, 0);
      });
    });
  });
});