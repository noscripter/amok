'use strict';

const browser = require('browser_process');
const net = require('net');
const path = require('path');
const rdbg = require('rdbg');
const temp = require('temp');
const url = require('url');
const util = require('util');

const debug = util.debuglog('amok-browse');

function browse(port, command, args, options) {
  if (typeof args === 'undefined') {
    args = [];
  } else {
    args = args.slice(0);
  }

  function browse(client, runner, done) {
    let server = net.createServer();

    server.once('error', error => {
      done(error);
    });

    server.once('listening', () => {
      debug('server listening');

      debug('close server');
      server.close();
    });

    server.once('close', () => {
      debug('server close');

      let uri = url.parse(runner.get('url'));
      if (uri.protocol === null && uri.pathname.match(/.html/)) {
        uri = url.parse(url.resolve('file://', path.join(path.resolve(uri.pathname))));
      }

      runner.set('url', url.format(uri));

      // TODO, move into browser_process.createProfile, deleting the first run file
      // should be equivilent of providing these options, and be compatible with how firefox does it.
      args.unshift('--no-first-run', '--no-default-browser-check');
      let dirname = temp.path(command);
      args.unshift.apply(args, browser.options(command, {
        profile: dirname,
        url: runner.get('url'),
        debug: port,
      }));

      debug('spawn %s %s', command, args.join(' '));
      browser.spawn(command, args, options, (error, ps) => {
        if (error) {
          debug('bail %s', error.description);
          return done(error);
        }

        runner.once('close', () => {
          debug('kill process');
          ps.kill('SIGTERM');
        });

        debug('find %s', url);
        setTimeout(function find(retry) {
          rdbg.get(port, 'localhost', (error, targets) => {
            if (error) {
              targets = [];
            }

            let matches = targets.filter(target => {
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
  }

  return browse;
}

module.exports = browse;
