'use strict';

const compiler = require('compiler_process');
const fs = require('fs');
const path = require('path');
const temp = require('temp');
const util = require('util');

const debug = util.debuglog('amok-compiler');

function compile(command, args, options) {
  if (typeof args == 'undefined') {
    args = [];
  } else {
    args = args.slice(0);
  }

  function compile(client, runner, done) {
    var entry = args.find(arg => {
      return arg.match(/(.js|.ts|.coffee)$/);
    });

    let dirname = temp.mkdirSync(command);
    let pathname = path.normalize(entry);
    let basename = path.basename(pathname);
    let filename = path.join(dirname, basename).replace(/\.[^\.]+$/, '.js');

    let scripts = {};
    scripts[pathname] = filename;
    runner.set('scripts', scripts);

    args.unshift.apply(args, compiler.options(command, {
      outfile: filename,
      watch: true,
    }));

    debug('spawn %s %s', command, args.join(' '));
    compiler.spawn(command, args, options, (error, ps) => {
      if (error) {
        return done(error);
      }

      runner.once('close', () => {
        ps.kill('SIGTERM');
      });

      debug('wait %s', filename);
      process.nextTick(function wait() {
        debug('...');
        fs.stat(filename, (error, stat) => {
          if (error || stat.size === 0) {
            return process.nextTick(wait);
          }

          setTimeout(() => {
            done();
          }, 250);
        });
      });
    });
  }

  return compile;
}

module.exports = compile;
