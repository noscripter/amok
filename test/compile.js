'use strict';

var amok = require('..');
var fs = require('fs');
var path = require('path');
var test = require('tape');

const compiler = process.env['TEST_COMPILER'] || '';

test(`compile with ${compiler}`, assert =>  {
  assert.plan(3);

  let runner = amok.createRunner();

  let dirname = `test/fixture/compile-${compiler}`;
  let entries = fs.readdirSync(dirname).map(function (filename) {
    return path.join(dirname, filename);
  }).filter(function (filename) {
    return filename.search('out') === -1;
  });

  runner.use(amok.compile(compiler, entries));
  runner.once('run', () => {
    let scripts = runner.get('scripts');
    let pathnames = Object.keys(scripts);
    let filename = scripts[pathnames[0]];

    assert.equal(pathnames.length, 1);
    assert.equal(pathnames[0], path.normalize(pathnames[0]));
    assert.equal(fs.readFileSync(filename, 'utf-8'), fs.readFileSync(path.join(dirname, 'out.js'), 'utf-8'));
    runner.close();
  });

  runner.run();
});
