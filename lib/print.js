var util = require('util');

var debug = util.debuglog('amok-print');

function plugin(output) {
  return function print(client, runner, done) {
    client.console.on('data', function (message) {
      output.write(message.text + '\n');
    });

    client.on('connect', function () {
      client.console.enable(function (error) {
        if (error) {
          return client.emit('error', error);
        }
        debug('console');
      });
    });

    debug('ready');
    done();
  };
}

module.exports = plugin;
