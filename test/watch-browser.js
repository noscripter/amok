'use strict';

const amok = require('..');
const fs = require('fs');
const path = require('path');
const test = require('tape');
const url = require('url');

const browser = process.env['TEST_BROWSER'];
const port = process.env['TEST_PORT'] || 4000;

test(`watch events in ${browser}`, assert => {
  assert.plan(7);

  let runner = amok.createRunner();
  runner.set('url', 'test/fixture/watch-browser/index.html');
  runner.set('cwd', 'test/fixture/watch-browser');

  runner.use(amok.browse(port, browser));
  runner.use(amok.watch('*.txt'));

  runner.once('connect', () => {
    assert.pass('connect');

    let messages = [
      'ready',
      'fileCreate file.txt',
      'fileChange file.txt',
      'fileRemove file.txt'
    ];

    runner.client.console.on('data', message => {
      assert.equal(message.text, messages.shift(), message.text);

      if (messages.length == 0) {
        runner.once('close', () => {
          assert.pass('close');
        });

        return runner.close();
      }

      if (message.text === 'ready') {
        fs.writeFileSync('test/fixture/watch-browser/file.txt', 'hello', 'utf-8');
      } else if (message.text === 'fileCreate file.txt') {
        fs.writeFileSync('test/fixture/watch-browser/file.txt', 'hello world', 'utf-8');
      } else if (message.text === 'fileChange file.txt') {
        fs.unlinkSync('test/fixture/watch-browser/file.txt');
      }
    });

    runner.client.console.enable(function (error) {
      assert.error(error);
    });
  });

  runner.connect(port);
});
