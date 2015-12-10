'use strict';

const amok = require('..');
const test = require('tape');

test('run plugins', assert => {
  test.plan(4);

  let runner = amok.createRunner();
  runner.use(function one(client, runner, done) {
    test.pass();
    done();
  });

  runner.use(function two(client, runner, done) {
    test.pass();
    done();
  });

  runner.run(function ready(error, client, runner) {
    test.error(error);

    runner.once('close', () => {
      test.pass('close');
    });

    runner.close();
  });
});
