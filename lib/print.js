'use strict';

const util = require('util');

const debug = util.debuglog('amok-print');

function print(output) {
  function print(client, runner, done) {
    client.console.on('data', message => {
      output.write(message.text + '\n');
    });

    client.on('connect', () => {
      client.console.enable(error => {
        if (error) {
          return client.emit('error', error);
        }

        debug('console');
      });
    });

    debug('ready');
    done();
  }

  return print;
}

module.exports = print;
