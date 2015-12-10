'use strict';

const amok = require('..');
const fs = require('fs');
const path = require('path');
const test = require('tape');

const browser = process.env['TEST_BROWSER'] || '';
const compiler = process.env['TEST_COMPILER'] || '';
const port = process.env['TEST_PORT'] || 4000;

test(`hotswap script compiled with ${compiler} in ${browser}`, assert => {
  assert.plan(14);

  const dirname = `test/fixture/hotpatch-browser-${compiler}`;
  const filename = fs.readdirSync(dirname).find(function (filename) {
    return filename.match(/index\.(js|ts|coffee)$/);
  });

  let runner = amok.createRunner();

  runner.use(amok.compile(compiler, [
    path.join(dirname, filename),
  ], {
    stdio: 'inherit'
  }));

  runner.use(amok.serve(9222, 'localhost'));
  runner.use(amok.browse(port, browser));
  runner.use(amok.hotpatch());

  runner.once('connect', () => {
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

    let source = fs.readFileSync(path.join(dirname, filename), 'utf-8');

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

      setTimeout(() => {
        fs.writeFileSync(path.join(dirname, filename), source, 'utf-8');
      });
    });

    runner.client.console.enable(error => {
      assert.error(error, 'console enabled');
    });
  });

  runner.connect(port);
});
