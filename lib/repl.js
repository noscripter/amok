var repls = require('repl');
var util = require('util');

var debug = util.debuglog('amok-repl');

function plugin(input, output, options) {
  if (typeof options === 'undefined') {
    options = {};
  }

  return function repl(client, runner, done) {
    debug('start');
    var repl = repls.start({
      input: input,
      output: output,
      useColors: options.useColors
    });

    repl.on('exit', function() {
      runner.close();
    });

    repl.eval = function (cmd, context, filename, callback) {
      client.runtime.evaluate(cmd, function (error, output) {
        if (error) {
          return callback(error);
        }

        var result = output.result;
        if (result.value === 'null') {
          return callback(null, null);
        } else if (result.type === 'undefined') {
          return callback(null, undefined);
        } else if (result.value !== undefined) {
          return callback(null, result.value);
        } else if (result.type === 'function') {
          var fn = new Function();
          return callback(null, fn);
        } else if (result.type === 'object') {
          var obj = {};
          return callback(null, obj);
        }
      });
    };

    repl.complete = function (line, callback) {
      callback([], line);
    };

    client.console.on('data', function (message) {
      repl.output.clearLine();
      repl.output.cursorTo(0);
      repl.output.write(message.text + '\n');
      repl.prompt(true);
    });

    client.on('connect', function () {
      client.console.enable(function (error) {
        if (error) {
          return client.emit('error', error);
        }

        debug('console enabled');
      });

      client.runtime.enable(function (error) {
        if (error) {
          return client.emit('error');
        }

        debug('runtime');
      });
    });

    debug('ready');
    done();
  };
}

module.exports = plugin;
