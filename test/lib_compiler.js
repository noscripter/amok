var amok = require('..');
var test = require('tape');
var fs = require('fs');
var path = require('path');

var commands = [
  'babel',
  'coffee',
  'tsc',
  'watchify',
  'webpack'
];

commands.forEach(function (command, index) {
  test('compile with ' + command, function (assert) {
    assert.plan(5);

    var runner = amok.createRunner();
    assert.on('end', function () {
      runner.close();
    });

    var dirname = 'test/fixture/compile-' + command;
    var entries = fs.readdirSync(dirname).map(function (filename) {
      return path.join(dirname, filename);
    }).filter(function (filename) {
      return filename.search('out') === -1;
    });

    runner.use(amok.compiler(command, entries));
    runner.run(function (error, client, runner) {
      assert.error(error);
      assert.ok(client, 'client');
      assert.ok(runner, 'runner');

      var scripts = runner.get('scripts');
      var pathnames = Object.keys(scripts);
      var filename = scripts[pathnames[0]];

      assert.equal(pathnames.length, 1);
      assert.equal(fs.readFileSync(filename, 'utf-8'), fs.readFileSync(path.join(dirname, 'out.js'), 'utf-8'));
    });
  });
});
