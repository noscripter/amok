var child = require('child_process');
var fs = require('fs');
var http = require('http');
var path = require('path');
var test = require('tape');
var url = require('url');

var bin = require('../package.json').bin['amok'];
var version = [
  '-V',
  '--version',
];

version.forEach(function (arg) {
  var args = [bin, arg];
  test(args.join(' '), function (test) {
    test.plan(2);

    var ps = child.spawn('node', args);
    ps.stdout.setEncoding('utf-8');
    ps.stdout.on('data', function (data) {
      test.equal(data, require('../package.json').version + '\n');
    });

    ps.on('close', function (code) {
      test.equal(code, 0);
    });
  });
});

var help = [
  '-h',
  '--help'
];

help.forEach(function (arg) {
  var args = [bin, arg];

  test(args.join(' '), function (test) {
    test.plan(2);

    var ps = child.spawn('node', args);
    ps.stdout.setEncoding('utf-8');
    ps.stdout.on('data', function (data) {
      test.ok(data.indexOf('Usage:') > -1);
    });

    ps.on('close', function (code) {
      test.equal(code, 0);
    });
  });
});
