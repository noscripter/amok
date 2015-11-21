var compiler = require('compiler_process');
var fs = require('fs');
var path = require('path');
var temp = require('temp');
var util = require('util');

var debug = util.debuglog('amok-compiler');

function compile(command, args, options) {
  if (typeof args == 'undefined') {
    args = [];
  } else {
    args = args.slice(0);
  }

  return function compile(client, runner, done) {
    var entry = args.filter(function (arg) {
      return arg.match(/(.js|.ts|.coffee)$/);
    })[0];

    var dirname = temp.mkdirSync(command);
    var pathname = path.normalize(entry);
    var basename = path.basename(pathname);
    var filename = path.join(dirname, basename).replace(/\.[^\.]+$/, '.js');

    var scripts = {};
    scripts[pathname] = filename;
    runner.set('scripts', scripts);

    args.unshift.apply(args, compiler.options(command, {
      outfile: filename,
      watch: true,
    }));

    debug('spawn %s %s', command, args.join(' '));
    compiler.spawn(command, args, options, function (error, ps) {
      if (error) {
        debug('bail %s', error.description);
        return done(error);
      }

      runner.once('close', function kill() {
        debug('kill');
        ps.kill('SIGTERM');
      });

      debug('wait %s', filename);
      process.nextTick(function wait() {
        fs.stat(filename, function (error, stat) {
          if (error || stat.size === 0) {
            return process.nextTick(wait);
          }

          setTimeout(function () {
            debug('ready');
            done();
          }, 250);
        });
      });
    });
  };
}

module.exports = compile;
