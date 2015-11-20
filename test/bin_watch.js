var child = require('child_process');
var fs = require('fs');
var http = require('http');
var path = require('path');
var sculpt = require('sculpt');
var test = require('tape');
var url = require('url');

var bin = require('../package.json').bin['amok'];

var browsers = (process.env['TEST_BROWSERS'] || 'chrome,chromium').split(',');

browsers.forEach(function (browser) {
  var args = [
    bin,
    '--cwd',
    'test/fixture/watch',
    '--watch',
    '*.txt',
    '--browser',
    browser,
    url.resolve('file://', path.join('/' + __dirname, '/fixture/watch/index.html'))
  ];

  test(args.join(' '), function (test) {
    test.plan(5);

    var ps = child.spawn('node', args);
    ps.stderr.pipe(process.stderr);
    ps.on('close', function () {
      test.pass('close');
    });

    var messages = [
      'ready',
      'fileCreate file.txt',
      'fileChange file.txt',
      'fileRemove file.txt'
    ];

    ps.stdout.setEncoding('utf-8');
    ps.stdout.pipe(sculpt.split(/\r?\n/)).on('data', function (line) {
      if (line.length === 0) {
        return;
      }

      test.equal(line, messages.shift(), line);

      if (line === 'ready') {
        fs.writeFileSync('test/fixture/watch/file.txt', 'hello', 'utf-8');
      } else if (line === 'fileCreate file.txt') {
        fs.writeFileSync('test/fixture/watch/file.txt', 'hello world', 'utf-8');
      } else if (line === 'fileChange file.txt') {
        fs.unlinkSync('test/fixture/watch/file.txt');
      }

      if (messages.length === 0) {
        ps.kill();
      }
    });
  });
});

browsers.forEach(function (browser) {
  var args = [
    bin,
    '--watch',
    '**/*.txt',
    '--browser',
    browser,
    'test/fixture/watch/index.js',
  ];

  test(args.join(' '), function (test) {
    test.plan(5);

    var ps = child.spawn('node', args);
    ps.stderr.pipe(process.stderr);
    ps.on('close', function () {
      test.pass('close');
    });

    var messages = [
      'ready',
      'fileCreate test/fixture/watch/file.txt',
      'fileChange test/fixture/watch/file.txt',
      'fileRemove test/fixture/watch/file.txt'
    ];

    ps.stdout.setEncoding('utf-8');
    ps.stdout.pipe(sculpt.split(/\r?\n/)).on('data', function (line) {
      if (line.length === 0) {
        return;
      }

      test.equal(line, messages.shift(), line);

      if (line === 'ready') {
        fs.writeFileSync('test/fixture/watch/file.txt', 'hello', 'utf-8');
      } else if (line === 'fileCreate test/fixture/watch/file.txt') {
        fs.writeFileSync('test/fixture/watch/file.txt', 'hello world', 'utf-8');
      } else if (line === 'fileChange test/fixture/watch/file.txt') {
        fs.unlinkSync('test/fixture/watch/file.txt');
      }

      if (messages.length === 0) {
        ps.kill();
      }
    });
  });
});
