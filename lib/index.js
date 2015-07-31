var events = require('events');
var rdbg = require('rdbg');
var url = require('url');
var util = require('util');
var ware = require('ware');

var debug = util.debuglog('amok');

function Runner() {
  events.EventEmitter.call(this);

  this.client = rdbg.createClient();
  this.plugins = [];

  this.settings = {};
}

util.inherits(Runner, events.EventEmitter);

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

  var stack = ware(this.plugins);
  stack.run(this.client, this, callback);
};

Runner.prototype.connect = function (port, host, callback) {
  this.run(function (error, client, runner) {
    if (error) {
      return this.emit('error', error);
    }

    if (callback) {
      runner.on('connect', callback);
    }

    client.once('ready', function () {
      debug('connect');
      runner.emit('connect');
    });

    rdbg.get(port, host, function (error, targets) {
      if (error) {
        return runner.emit('error', error);
      }

      var target = targets.filter(function (target) {
        return runner.get('url') === target.url;
      })[0];

      client.connect(target);
    });
  }.bind(this));
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

module.exports = new Runner();

module.exports.createRunner = createRunner;
module.exports.browser = require('./browser');
module.exports.compiler = require('./compiler');
module.exports.hotpatch = require('./hotpatch');
module.exports.multiplexer = require('./multiplexer');
module.exports.repl = require('./repl');
module.exports.server = require('./server');
module.exports.watch = require('./watch');
module.exports.print = require('./print');
