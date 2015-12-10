'use strict';

const amok = require('..');
const net = require('net');
const test = require('tape');
const url = require('url');
const path = require('path');
const temp = require('temp');

const browser = process.env['TEST_BROWSER'] || 'chrome';
const port = process.env['TEST_PORT'] || 4000;

test(`open relative file path in ${browser}`, assert => {
  const filename = 'test/fixture/browse/index.html';

  assert.plan(2);

  let runner = amok.createRunner();

  runner.set('url', filename);
  runner.use(amok.browse(port, browser));

  runner.once('connect', () => {
    assert.equal(runner.get('url'), `file://${path.resolve(filename)}`);
    runner.once('close', () => {
      assert.pass('close');
    });

    runner.close();
  });

  runner.connect(port);
});

test(`open absolute file path in ${browser}`, assert => {
  const filename = path.resolve('test/fixture/browse/index.html');

  assert.plan(2);

  let runner = amok.createRunner();

  runner.set('url', filename);
  runner.use(amok.browse(port, browser));

  runner.once('connect', () => {
    assert.equal(runner.get('url'), `file://${filename}`);
    runner.once('close', () => {
      assert.pass('close');
    });

    runner.close();
  });

  runner.connect(port);
});

test(`open absolute file url in ${browser}`, assert => {
  const filename = `file://${path.resolve('test/fixture/browse/index.html')}`;

  assert.plan(2);

  let runner = amok.createRunner();

  runner.set('url', filename);
  runner.use(amok.browse(port, browser));

  runner.once('connect', () => {
    assert.equal(runner.get('url'), filename);
    runner.once('close', () => {
      assert.pass('close');
    });

    runner.close();
  });

  runner.connect(port);
});

test(`error when port is in use`, assert => {
  assert.plan(2);

  let server = net.createServer();
  server.on('listening', function() {
    let runner = amok.createRunner();

    runner.use(amok.browse(port, browser));

    runner.on('error', error => {
      assert.equal(error.code, 'EADDRINUSE');
      runner.once('close', () => {
        server.once('close', () => {
          assert.pass();
        });

        server.close();
      });

      runner.close();
    });

    runner.connect(port, 'localhost');
  });

  server.listen(port);
});
