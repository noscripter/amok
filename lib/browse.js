var browser = require('browser_process');
var net = require('net');
var path = require('path');
var rdbg = require('rdbg');
var temp = require('temp');
var url = require('url');
var util = require('util');

var debug = util.debuglog('amok-browse');

function browse(port, command, args, options) {
  if (typeof args === 'undefined') {
    args = [];
  } else {
    args = args.slice(0);
  }

  return function browse(client, runner, done) {
    var server = net.createServer();

    server.once('error', function(error) {
      debug('server error', error);
      done(error);
    });

    server.once('listening', function() {
      debug('server listening');

      debug('close server');
      server.close();
    });

    server.once('close', function() {
      debug('server close');

      var uri = url.parse(runner.get('url'));
      if (uri.protocol === null && uri.pathname.match(/.html/)) {
        uri = url.parse(url.resolve('file://', path.join(path.resolve(uri.pathname))));
      }

      runner.set('url', url.format(uri));

      // TODO, move into browser_process.createProfile, deleting the first run file
      // should be equivilent of providing these options, and be compatible with how firefox does it.
      args.unshift('--no-first-run', '--no-default-browser-check');
      var dirname = temp.path(command);
      args.unshift.apply(args, browser.options(command, {
        profile: dirname,
        url: runner.get('url'),
        debug: port,
      }));

      debug('spawn %s %s', command, args.join(' '));
      browser.spawn(command, args, options, function (error, ps) {
        if (error) {
          debug('bail %s', error.description);
          return done(error);
        }

        runner.once('close', function kill() {
          debug('kill process');
          ps.kill('SIGTERM');
        });

        debug('find %s', url);
        setTimeout(function find(retry) {
          rdbg.get(port, 'localhost', function (error, targets) {
            if (error) {
              targets = [];
            }

            var matches = targets.filter(function (target) {
              return runner.get('url') === url.format(url.parse(target.url));
            });

            if (matches.length > 0) {
              debug('ready');
              return done();
            } else if (retry) {
              return setTimeout(find, 1000, --retry);
            }

            if (error === undefined) {
              error = new Error('Cannot find browser tab \'' + url + '\'');
            }

            debug('find error', error);
            done(error);
          });
        }, 1000, 120);
      });
    });

    debug('starting server on port', port);
    server.listen(port);
  };
}

module.exports = browse;
