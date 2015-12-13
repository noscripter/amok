'use strict';

const amok = require('..');
const test = require('tape');

test('run plugins', assert => {
  assert.plan(3);

  let runner = amok.createRunner();
  runner.use(function one(client, runner, done) {
    assert.pass();
    done();
  });

  runner.use(function two(client, runner, done) {
    assert.pass();
    done();
  });

  runner.once('run', () => {
    runner.once('close', () => {
      assert.pass('close');
    });

    runner.close();
  });

  runner.run();
});
