'use strict';

const amok = require('..');
const fs = require('fs');
const test = require('tape');

const browser = process.env['TEST_BROWSER'] || 'chrome';
const port = process.env['TEST_PORT'] || 4000;

test(`hotswap script in ${browser}`, assert => {
  assert.plan(14);

  let runner = amok.createRunner();

  runner.set('url', 'test/fixture/hotpatch-browser/index.html');
  runner.use(amok.browse(port, browser));
  runner.use(amok.hotpatch());

  runner.once('connect', () => {
    assert.comment('runner connected');

    let messages = [
      'ready',
      'step-0',
      'step-1',
      'step-2',
      'step-3',
      'step-4',
      'step-5',
      'step-6',
      'step-7',
      'step-8',
      'step-9',
      'step-0',
    ];

    let source = fs.readFileSync('test/fixture/hotpatch-browser/index.js', 'utf-8');

    runner.client.console.on('data', message => {
      assert.equal(message.text, messages.shift(), message.text);

      if (messages.length == 0) {
        runner.once('close', () => {
          assert.pass('close');
        });

        return runner.close();
      }

      if (message.text.match(/^step-[0-9]/)) {
        source = source.replace(message.text, messages[0]);
      }

      fs.writeFileSync('test/fixture/hotpatch-browser/index.js', source, 'utf-8');
    });

    runner.client.console.enable(error => {
      assert.error(error, 'console enabled');
    });
  });

  runner.connect(port);
});
