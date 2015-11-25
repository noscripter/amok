var repl = require('repl');
var util = require('util');
var print = require('./print');

var debug = util.debuglog('amok-interact');

function interact(input, output, options) {
  if (typeof options === 'undefined') {
    options = {};
  }

  return function interact(client, runner, done) {
    debug('start');
    var rli = repl.start({
      input: input,
      output: output,
      useColors: options.useColors
    });

    rli.on('exit', function() {
      runner.close();
    });

    rli.eval = function (cmd, context, filename, callback) {
      client.runtime.evaluate(cmd, function (error, output) {
        if (error) {
          return callback(error);
        }

        var result = output.result;
        if (result.type === 'string') {
          return callback(null, result.value);
        } else if (result.type === 'function') {
          var fn = new Function('return ' + result.description.replace('[native code]', '/* remote code */'));
          return callback(null, fn());
        } else if (result.subtype === 'error') {
          return callback(result.description);
        } else if (result.type === 'object') {
          var obj = {};
          return callback(null, obj);
        } else {
          return callback(null, eval(result.value));
        }
      });
    };

    rli.complete = function (line, callback) {
      callback([], line);
    };

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

    var printer = print(rli.output);
    printer(client, runner, done);
  };
}

module.exports = interact;
