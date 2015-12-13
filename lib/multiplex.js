'use strict';

const http = require('http');
const url = require('url');
const util = require('util');
const ws = require('ws');

function multiplex(port, host, debugPort, debugHost) {
  function multiplex(client, runner, done) {
    // TODO The meat of this implementation should probaly go into an rdbg adapter module.
    let upstream = {};

    let server = http.createServer();
    server.on('request', (request, response) => {
      let upstreamRequest = http.request({
        port: debugPort,
        hostname: debugHost,
        path: request.url,
      });

      if (request.url == '/json' || request.url === '/json/list') {
        upstreamRequest.on('response', (upstreamResponse) => {
          let data = '';

          upstreamResponse.on('data', (chunk) => {
            data += chunk;
          });

          upstreamResponse.on('end', () => {
            let targets = JSON.parse(data);
            targets.forEach(target => {
              let webSocketDebuggerUrl = Object.keys(upstream).find(key => {
                return key.search(target.id);
              });

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
        upstreamRequest.on('response', upstreamResponse => {
          upstreamResponse.pipe(response);
        });

        upstreamRequest.end();
      }
    });

    let socket = ws.createServer({ server: server });
    socket.on('connection', connection => {
      let upstreamUrl = url.format({
        protocol: 'ws',
        slashes: true,
        hostname: debugHost,
        port: debugPort,
        pathname: connection.upgradeReq.url,
      });

      if (!upstream[upstreamUrl]) {
        let upstreamConnection = ws.createConnection(upstreamUrl);
        upstream[upstreamUrl] = {
          localId: 0,
          connection: upstreamConnection,
          connections: [connection],
          mappings: {},
          notifications: [],
        };

        upstreamConnection.on('close', () => {
          upstream[upstreamUrl].connections.forEach(connection => {
            connection.close();
          });

          delete upstream[upstreamUrl];
        });

        upstreamConnection.on('message', data => {
          let message = JSON.parse(data);

          if (message.id === undefined) {
            upstream[upstreamUrl].notifications.push(JSON.parse(data));
            upstream[upstreamUrl].connections.forEach(connection => {
              connection.send(data);
            });
          } else {
            let mappings = upstream[upstreamUrl].mappings[message.id];
            message.id = mappings.id;
            mappings.connection.send(JSON.stringify(message));
          }
        });
      } else {
        upstream[upstreamUrl].connections.push(connection);
      }

      connection.notifications = upstream[upstreamUrl].notifications.slice(0);
      connection.upstream = upstream[upstreamUrl];

      connection.on('message', data => {
        let upstream = connection.upstream;

        let message = JSON.parse(data);

        if (message.method && message.method.match(/enable$/)) {
          let domain = message.method.split('.')[0];

          connection.notifications = connection.notifications.filter(notification => {
            if (notification.method.search(domain)) {
              connection.send(JSON.stringify(notification));
              return false;
            }

            return true;
          });
        }

        let local = upstream.localId++;
        let remote = message.id;
        message.id = local;

        upstream.mappings[local] = {
          connection: connection,
          id: remote,
          message: data
        };

        if (upstream.connection.readyState == 0) {
          upstream.connection.once('open', () => {
            upstream.connection.send(JSON.stringify(message));
          });
        } else {
          upstream.connection.send(JSON.stringify(message));
        }
      });

      connection.on('close', () => {
        let upstream = connection.upstream;
        let index = upstream.connections.indexOf(connection);
        if (index > -1) {
          upstream.connections.splice(index, 1);
        }
      });
    });

    server.on('error', (error) => {
      done(error);
    });

    server.on('listening', () => {
      done();
    });

    server.listen(port, host);
  }

  return multiplex;
}

module.exports = multiplex;
