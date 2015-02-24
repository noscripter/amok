var web = require('browser_process');
var util = require('util');
var rdbg = require('rdbg');
var temp = require('temp');

var debug = util.debuglog('amok-browser');

function plugin(port, command, args, options) {
  if (typeof args === 'undefined') {
    args = [];
  } else {
    args = args.slice(0);
  }

  return function browser(client, runner, done) {
    var url = runner.get('url');

    // TODO, move into browser_process.createProfile, deleting the first run file
    // should be equivilent of providing these options, and be compatible with how firefox does it.
    args.unshift('--no-first-run', '--no-default-browser-check');
    var dirname = temp.path(command);
    args.unshift.apply(args, web.options(command, {
      profile: dirname,
      url: url,
      debug: port,
    }));

    debug('spawn %s %s', command, args.join(' '));
    web.spawn(command, args, options, function (error, browser) {
      if (error) {
        debug('bail %s', error.description);
        return done(error);
      }

      runner.once('close', function kill() {
        debug('kill');
        browser.kill('SIGTERM');
      });

      debug('find %s', url);

      process.nextTick(function find() {
        rdbg.get(port, 'localhost', function (error, targets) {
          if (error) {
            return process.nextTick(find);
          }

          var target = targets.filter(function (target) {
            return url === target.url;
          })[0];

          if (!target) {
            return process.nextTick(find);
          }

          debug('ready');
          done();
        });
      });
    });
  };
}

module.exports = plugin;
