'use strict';

const browser = require('browser_process');
const net = require('net');
const os = require('os');
const path = require('path');
const rdbg = require('rdbg');
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
      server.removeListener('error', done);
      server.close();
    });

    server.once('close', () => {
      // TODO, move into browser_process.createProfile, deleting the first run file
      // should be equivilent of providing these options, and be compatible with how firefox does it.
      args.unshift('--no-first-run', '--no-default-browser-check');
      args.unshift.apply(args, browser.options(command, {
        profile: path.join(os.homedir(), '.amok', `${command}-${port}`),
        url: runner.get('url'),
        debug: port,
      }));

      debug('spawn %s %s', command, args.join(' '));
      browser.spawn(command, args, options, (error, ps) => {
        if (error) {
          return done(error);
        }

        runner.once('close', () => {
          ps.kill('SIGTERM');
        });

        let find = () => {
          debug('...');
          rdbg.get(port, 'localhost', (error, targets) => {
            let target = (targets || []).find(target => {
              return /^(http|file):/.exec(target.url);
            });

            if (target) {
              runner.set('url', target.url);
              return done();
            }

            setTimeout(find, 1000);
          });
        };

        debug('find target');
        find();
      });
    });

    server.listen(port);
  }

  return browse;
}

module.exports = browse;
