var http = require('http');
var url = require('url');
var ws = require('ws');
var util = require('util');

function plugin(port, host, debugPort, debugHost) {
  return function multiplexer(client, runner, done) {
    // TODO The meat of this implementation should probaly go into an rdbg adapter module.
    var upstream = {};

    var server = http.createServer();
    server.on('request', function (request, response) {
      var upstreamRequest = http.request({
        port: debugPort,
        hostname: debugHost,
        path: request.url,
      });

      if (request.url == '/json' || request.url === '/json/list') {
        upstreamRequest.on('response', function (upstreamResponse) {
          var data = '';

          upstreamResponse.on('data', function (chunk) {
            data += chunk;
          });

          upstreamResponse.on('end', function () {
            var targets = JSON.parse(data);
            targets.forEach(function (target) {
              var webSocketDebuggerUrl = Object.keys(upstream).filter(function(key) {
                return key.search(target.id);
              })[0];

              if (target.webSocketDebuggerUrl || webSocketDebuggerUrl) {
                target.webSocketDebuggerUrl = url.format({
                  protocol: 'ws',
                  slashes: true,
                  port: port,
                  hostname: host,
                  pathname: '/devtools/page/' + target.id,
                });
              }

              if (target.webSocketDebuggerUrl) {
                target.devtoolsFrontendUrl = util.format('/devtools/inspector.html?ws=%s', target.webSocketDebuggerUrl.slice(5));
              }
            });

            response.end(JSON.stringify(targets, undefined, 2));
          });
        });

        upstreamRequest.end();
      } else {
        upstreamRequest.on('response', function (upstreamResponse) {
          upstreamResponse.pipe(response);
        });

        upstreamRequest.end();
      }
    });

    var socket = ws.createServer({ server: server });
    socket.on('connection', function (connection) {
      var upstreamUrl = url.format({
        protocol: 'ws',
        slashes: true,
        hostname: debugHost,
        port: debugPort,
        pathname: connection.upgradeReq.url,
      });

      if (!upstream[upstreamUrl]) {
        var upstreamConnection = ws.createConnection(upstreamUrl);
        upstream[upstreamUrl] = {
          localId: 0,
          connection: upstreamConnection,
          connections: [connection],
          mappings: {},
          notifications: [],
        };

        upstreamConnection.on('close', function() {
          upstream[upstreamUrl].connections.forEach(function(connection) {
            connection.close();
          });

          delete upstream[upstreamUrl];
        });

        upstreamConnection.on('message', function (data) {
          var message = JSON.parse(data);

          if (message.id === undefined) {
            upstream[upstreamUrl].notifications.push(JSON.parse(data));
            upstream[upstreamUrl].connections.forEach(function (connection) {
              connection.send(data);
            });
          } else {
            var mappings = upstream[upstreamUrl].mappings[message.id];
            message.id = mappings.id;
            mappings.connection.send(JSON.stringify(message));
          }
        });
      } else {
        upstream[upstreamUrl].connections.push(connection);
      }

      connection.notifications = upstream[upstreamUrl].notifications.slice(0);
      connection.upstream = upstream[upstreamUrl];

      connection.on('message', function (data) {
        var upstream = connection.upstream;

        var message = JSON.parse(data);

        if (message.method && message.method.match(/enable$/)) {
          var domain = message.method.split('.')[0];

          connection.notifications = connection.notifications.filter(function (notification) {
            if (notification.method.search(domain)) {
              connection.send(JSON.stringify(notification));
              return false;
            }

            return true;
          });
        }

        var local = upstream.localId++;
        var remote = message.id;
        message.id = local;

        upstream.mappings[local] = {
          connection: connection,
          id: remote,
          message: data
        };

        if (upstream.connection.readyState == 0) {
          upstream.connection.once('open', function () {
            upstream.connection.send(JSON.stringify(message));
          });
        } else {
          upstream.connection.send(JSON.stringify(message));
        }
      });

      connection.on('close', function () {
        var upstream = connection.upstream;
        var index = upstream.connections.indexOf(connection);
        if (index > -1) {
          upstream.connections.splice(index, 1);
        }
      });
    });

    server.on('error', function (error) {
      done(error);
    });

    server.on('listening', function () {
      done();
    });

    server.listen(port, host);
  }
}

module.exports = plugin;