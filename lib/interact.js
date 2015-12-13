'use strict';

const repl = require('repl');
const util = require('util');

const debug = util.debuglog('amok-interact');

function interact(input, output, options) {
  if (typeof options === 'undefined') {
    options = {};
  }

  return function interact(client, runner, done) {
    debug('start');
    let rli = repl.start({
      input: input,
      output: output,
      useColors: options.useColors
    });

    rli.on('exit', () => {
      runner.close();
    });

    rli.eval = (cmd, context, filename, callback) => {
      client.runtime.evaluate(cmd, (error, output) => {
        if (error) {
          return callback(error);
        }

        let result = output.result;
        if (result.type === 'string') {
          return callback(null, result.value);
        } else if (result.type === 'function') {
          let fn = new Function('return ' + result.description.replace('[native code]', '/* remote code */'));
          return callback(null, fn());
        } else if (result.subtype === 'error') {
          return callback(result.description);
        } else if (result.type === 'object') {
          let obj = {};
          return callback(null, obj);
        } else {
          return callback(null, eval(result.value));
        }
      });
    };

    rli.complete = (line, callback) => {
      callback([], line);
    };

    client.console.on('data', (message) => {
      repl.output.clearLine();
      repl.output.cursorTo(0);
      repl.output.write(message.text + '\n');
      repl.prompt(true);
    });

    client.on('connect', () => {
      client.console.enable(error => {
        if (error) {
          return client.emit('error', error);
        }

        debug('console enabled');
      });

      client.runtime.enable(error => {
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

module.exports = interact;
