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
  var args = [
    bin,
    '--cwd',
    'test/fixture/watch-events',
    '--watch',
    '*.txt',
    '--browser',
    browser,
    url.resolve('file://', path.join('/' + __dirname, '/fixture/watch-events/index.html'))
  ];

  test(args.join(' '), function (assert) {
    var steps = {
      'ready': function(assert) {
        fs.writeFile('test/fixture/watch-events/file.txt', 'hello', 'utf-8', function(error) {
          assert.error(error);
        });
      },
      
      'add file.txt': function(assert) {
        fs.writeFile('test/fixture/watch-events/file.txt', 'hello world', 'utf-8', function(error) {
          assert.error(error);
        });
      },
      
      'change file.txt': function(assert) {
        fs.unlink('test/fixture/watch-events/file.txt', function(error) {
          assert.error(error);
        });
      },

      'unlink file.txt': function(assert) {
        assert.pass();
      },
    };
    
    var keys = Object.keys(steps);
    assert.plan(keys.length * 2);

    var ps = child.spawn('node', args);
    ps.stderr.pipe(process.stderr);
    assert.on('end', function () {
      ps.kill();
    });

    ps.stdout.setEncoding('utf-8');
    ps.stdout.pipe(sculpt.split(/\r?\n/)).on('data', function (line) {
      if (!keys.length || !line.length) {
        return;
      }

      var key = keys.shift();
      steps[key](assert);
      assert.equal(line, key, line);
    });
  });
});

