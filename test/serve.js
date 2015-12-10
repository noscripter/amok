'use strict';

const amok = require('..');
const fs = require('fs');
const http = require('http');
const path = require('path');
const test = require('tape');
const url = require('url');

const port = process.env['TEST_PORT'] || 9966;

test('serve index.html', assert => {
  assert.plan(9);

  let runner = amok.createRunner();
  let pathnames = ['/', '/index.html'];

  runner.set('cwd', 'test/fixture/basic');
  runner.use(amok.serve(port, 'localhost'));

  runner.run((error, client, runner) => {
    assert.error(error);
    assert.ok(client, 'client');
    assert.ok(runner, 'runner');

    assert.equal(runner.get('url'), url.format({
      protocol: 'http',
      port: port,
      hostname: 'localhost',
      pathname: '/'
    }));

    pathnames.forEach((pathname) => {
      http.get({
        port: port,
        hostname: 'localhost',
        path: pathname
      }, response => {
          assert.equal(response.statusCode, 200);

          response.setEncoding('utf-8');

          let body = '';
          response.on('data', (chunk) => {
            body += chunk;
          });

          response.on('end', () => {
            assert.equal(body, fs.readFileSync('test/fixture/basic/index.html', 'utf-8'));

            pathnames.splice(pathnames.indexOf(pathname), 1);
            if (pathnames.length == 0) {
              runner.on('close', () => {
                assert.pass('close');
              });

              runner.close();
            }
          });
        });
    });
  });
});

test('generate index.html', assert => {
  assert.plan(13);

  let runner = amok.createRunner();
  runner.on('close', () => {
    assert.pass('close');
  });

  let pathnames = ['/', '/index.html'];

  runner.set('scripts', {
    'a.js': 'test/fixture/basic/index.js',
    'b.js': 'test/fixture/basic/index.js',
    'c.js': 'test/fixture/basic/index.js',
  });

  runner.use(amok.serve(port, 'localhost'));

  runner.run((error, client, runner) => {
    assert.error(error);
    assert.ok(client, 'client');
    assert.ok(runner, 'runner');

    assert.equal(runner.get('url'), url.format({
      protocol: 'http',
      port: port,
      hostname: 'localhost',
      pathname: '/'
    }));

    pathnames.forEach((pathname) => {
      http.get({
        port: port,
        hostname: 'localhost',
        path: pathname
      }, (response) => {
          assert.equal(response.statusCode, 200);

          response.setEncoding('utf-8');

          let body = '';
          response.on('data', (chunk) => {
            body += chunk;
          });

          response.on('end', () => {
            assert.ok(body.indexOf('<script src="a"></script>'));
            assert.ok(body.indexOf('<script src="b"></script>'));
            assert.ok(body.indexOf('<script src="c"></script>'));

            pathnames.splice(pathnames.indexOf(pathname), 1);
            if (pathnames.length < 1) {
              runner.close();
            }
          });
        });
    });
  });
});

test('generate favicon.ico', assert => {
  assert.plan(6);

  let runner = amok.createRunner();
  runner.on('close', () => {
    assert.pass('close');
  });

  runner.set('scripts', {
    'a.js': 'test/fixture/basic/index.js',
    'b.js': 'test/fixture/basic/index.js',
    'c.js': 'test/fixture/basic/index.js',
  });

  runner.use(amok.serve(port, 'localhost'));

  runner.run((error, client, runner) => {
    assert.error(error);
    assert.ok(client, 'client');
    assert.ok(runner, 'runner');

    assert.equal(runner.get('url'), url.format({
      protocol: 'http',
      port: port,
      hostname: 'localhost',
      pathname: '/'
    }));

    http.get({
      port: port,
      hostname: 'localhost',
      path: '/favicon.ico'
    }, (response) => {
        assert.equal(response.statusCode, 200);

        let body = '';
        response.on('data', (chunk) => {
          body += chunk;
        });

        response.on('end', () => {
          runner.close();
        });
      });
  });
});

test('generate index.html', assert => {
  assert.plan(13);

  let runner = amok.createRunner();
  runner.on('close', () => {
    assert.pass('close');
  });

  let pathnames = ['/', '/index.html'];

  runner.set('scripts', {
    'a.js': 'test/fixture/basic/index.js',
    'b.js': 'test/fixture/basic/index.js',
    'c.js': 'test/fixture/basic/index.js',
  });

  runner.use(amok.serve(port, 'localhost'));

  runner.run((error, client, runner) => {
    assert.error(error);
    assert.ok(client, 'client');
    assert.ok(runner, 'runner');

    assert.equal(runner.get('url'), url.format({
      protocol: 'http',
      port: port,
      hostname: 'localhost',
      pathname: '/'
    }));

    pathnames.forEach((pathname) => {
      http.get({
        port: port,
        hostname: 'localhost',
        path: pathname
      }, (response) => {
          assert.equal(response.statusCode, 200);

          response.setEncoding('utf-8');

          let body = '';
          response.on('data', (chunk) => {
            body += chunk;
          });

          response.on('end', () => {
            assert.ok(body.indexOf('<script src="a"></script>'));
            assert.ok(body.indexOf('<script src="b"></script>'));
            assert.ok(body.indexOf('<script src="c"></script>'));

            pathnames.splice(pathnames.indexOf(pathname), 1);
            if (pathnames.length < 1) {
              runner.close();
            }
          });
        });
    });
  });
});

test('serve scripts', assert => {
  assert.plan(13);

  let runner = amok.createRunner();
  runner.on('close', () => {
    assert.pass('close');
  });

  runner.set('cwd', 'test/fixture/basic');

  let scripts = {
    'index.js': 'index.html',
    'a.js': 'index.js',
    'b.js': 'index.js',
    'c.js': 'index.js',
  };

  runner.set('scripts', scripts);

  runner.use(amok.serve(port, 'localhost'));

  runner.run((error, client, runner) => {
    assert.error(error);
    assert.ok(client, 'client');
    assert.ok(runner, 'runner');

    assert.equal(runner.get('url'), url.format({
      protocol: 'http',
      port: port,
      hostname: 'localhost',
      pathname: '/'
    }));

    let pathnames = Object.keys(scripts);
    pathnames.forEach((pathname) => {
      http.get({
        port: port,
        hostname: 'localhost',
        path: url.resolve('/', pathname)
      }, (response) => {
          assert.equal(response.statusCode, 200);

          response.setEncoding('utf-8');

          let body = '';
          response.on('data', (chunk) => {
            body += chunk;
          });

          response.on('end', () => {
            let filename = scripts[pathname];
            assert.equal(body, fs.readFileSync(path.join('test/fixture/basic', filename), 'utf-8'));

            pathnames.splice(pathnames.indexOf(pathname), 1);
            if (pathnames.length < 1) {
              runner.close();
            }
          });
        });
    });
  });
});
