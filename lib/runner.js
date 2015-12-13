var events = require('events');
var rdbg = require('rdbg');
var url = require('url');
var util = require('util');
var ware = require('ware');

var debug = util.debuglog('amok');

function Runner() {
  events.EventEmitter.call(this);

  this._client = rdbg.createClient();
  this.plugins = [];

  this.settings = {};
}

util.inherits(Runner, events.EventEmitter);

Object.defineProperty(Runner.prototype, 'client', {
  get: function() {
    return this._client;
  },
});

Runner.prototype.get = function (name) {
  return this.settings[name];
};

Runner.prototype.set = function (name, value) {
  debug('set %s', name, value);
  this.settings[name] = value;
};

Runner.prototype.use = function (fn) {
  debug('use %s', fn._name || fn.name || '-');
  this.plugins.push(fn);

  return this;
};

Runner.prototype.run = function (callback) {
  debug('run');

  if (callback) {
    this.on('run', callback);
  }

  var stack = ware(this.plugins);
  stack.run(this.client, this, error => {
    if (error) {
      return this.emit('error', error);
    }

    this.emit('run');
  });
};

Runner.prototype.connect = function (port, host, callback) {
  this.use(function connect(client, runner, done) {
    rdbg.get(port, host, (error, targets) => {
      if (error) {
        return runner.emit('error', error);
      }

      if (callback) {
        client.on('connect', callback);
      }

      client.on('connect', () => {
        runner.emit('connect');
      });

      var target = targets.filter(function (target) {
        return runner.get('url') === url.format(url.parse(target.url));
      })[0];

      client.connect(target);
    });
  });

  this.run();
};

Runner.prototype.close = function () {
  debug('close');

  if (this.client) {
    this.client.close();
  }

  this.emit('close');
};

function createRunner() {
  return new Runner();
}

module.exports = createRunner();
module.exports.createRunner = createRunner;
module.exports.Runner = Runner;
