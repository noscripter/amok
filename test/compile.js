'use strict';

var amok = require('..');
var fs = require('fs');
var path = require('path');
var test = require('tape');

const compiler = process.env['TEST_COMPILER'] || '';

test(`compile with ${compiler}`, assert =>  {
  test.plan(6);

  let runner = amok.createRunner();

  let dirname = `test/fixture/compile-${compiler}`;
  let entries = fs.readdirSync(dirname).map(function (filename) {
    return path.join(dirname, filename);
  }).filter(function (filename) {
    return filename.search('out') === -1;
  });

  runner.use(amok.compile(command, entries));
  runner.run((error, client, runner) => {
    test.error(error);
    test.ok(client, 'client');
    test.ok(runner, 'runner');

    let scripts = runner.get('scripts');
    let pathnames = Object.keys(scripts);
    let filename = scripts[pathnames[0]];

    test.equal(pathnames.length, 1);
    test.equal(pathnames[0], path.normalize(pathnames[0]));
    test.equal(fs.readFileSync(filename, 'utf-8'), fs.readFileSync(path.join(dirname, 'out.js'), 'utf-8'));
    runner.close();
  });
});
