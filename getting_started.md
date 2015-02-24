# GETTING STARTED

## INTRODUCTION

## INSTALLING

[Watch video](https://www.youtube.com/watch?v=jj5S5hlY2t8)

### INSTALLING NODE.JS

Before installing amok, you need to install [node.js](http://nodejs.org) **v0.12 or greater**
since amok is written in JavaScript targeting the node runtime.

If you're using Mac or Windows the best way to install node.js is to use one of
the installers from [http://nodejs.org](http://nodejs.org), on Linux it should
be available via the system package manager like `apt-get` or `yum`.

### INSTALLING AMOK

Once node.js and npm is installed, amok can be installed from npm by running the following
command from the command line

```sh
$ npm install --global amok
```

Installing globally is recommended to have the command always available from any command line session by default.

Depending on your system configuration, the command may need to be run with
elevated user privileges.

If you see any errors regarding optional dependencies during the installation you can safely ignore them.

## WORKING WITH A BROWSER

[Watch video](https://www.youtube.com/watch?v=A4lf8aRaVeQ)

### CONNECTING TO AN EXISTING BROWSER

You can connect to a page in an existing browser page by providing amok with the url of that page.

```sh
$ amok http://localhost:4000
```

In this case however, the browser process has to be already listening for debug connections on the port
defined by the `--debug-port` option for this to work however, which can be done by launching the browser with a command line option.

```sh
$ chrome --remote-debugging-port=9222 http://localhost:4000
```

You should also be aware of how browser processes work.
A window in a browser does not equal a seperate instance of the browser. but rather just another window within that process.

If the browser is already running it will ignore any launch flags,
In order to realiably create a new seperate instance of a browser, you will have to specify a user profile directory for each of them,
if the profile does not exist in the specified path it will be created.

```sh
google-chrome --user-data-dir=~/profile1
google-chrome --user-data-dir=~/profile2
```

### STARTING A NEW BROWSER PROCESS

You can open a new browser process with its own unique profile by specifying the `--browser` option when invoking amok,
valid values for the browser options are `chrome` and `chromium`.

```sh
$ amok --browser chrome http://localhost:4000
```

If the browser is already running and listening for connections on the port defined by `--debug-port` it will open a new tab in that browser,
if not it will start a new browser process listening for debug connections on the port defined by the `--debug-port` option.

If you don't have the browser installed in a default vendor location,
you can set the full path of the executable with the `<BROWSER>_BIN` environment variable.

On Windows you would do this with `set` in the command line.

```sh
set CHROME_BIN="C:\\absolute\\path\\to\\chrome.exe"
```

On Unix, you would use `export`

```sh
export CHROME_BIN=/full/path/to/chrome
```

You can also specify additional command line options to use when opening the browser with the `<BROWSER>_FLAGS` environment variable,
If you'd like to override the browser profile specified by amok you can set this environment variable on a temporary, or permanent basis.

Again for Windows, with `set`

```sh
set CHROME_FLAGS="--user-data-dir=%HOMEDIR%\\myprofile"
```

And on Unix, with `export`

```sh
export CHROME_FLAGS="--user-data-dir=~/.myprofile"
```

## WORKING WITH THE DEVELOPMENT SERVER

### STARTING THE SERVER

If you give amok one or more files instead of a url, it will start a http server that serves all the files in the working directory, listening on the port and address defined by `--http-port` and `--http-host`.

```sh
$ amok index.js
```

This server will generate an index.html which contains script tags for all the input files, to disable the automatic index.html generation drop in an index.html file in the working directory.

### USING A PREPROCESSOR

While using the server you can also specify the `--compiler` option to enable incremental preprocessing of input files,
the preprocessed output will be saved in a temporary file and served in-place of the original input files.

Valid values for the `--compiler` option are `babel`, `coffee`, `tsc`, `watchify` and `webpack`.

```sh
$ amok --compiler babel index.js
```

You can pass additional command line options to the compiler with the end of option parsing delimiter `--`,
everything after that will be passed directly to the compiler.

```sh
$ amok --compiler babel index.js -- --source-maps
```

## EDITING CODE IN REALTIME

### HOT PATCHING

You can edit and tweak code live without reloading by passing the `--hot` option,
this will monitor active scripts and patch their source definitions in the runtime while the code is running.

```sh
$ amok --hot index.js
```

Changes to scripts are only executed at evaluation time, meaning that modifications to code that has already executed in the **past**
will have no effect.

Changes to code that will executed in the **future**, such as callbacks and event handlers however can be modified and tweaked in real-time.

### HOT PATCH EVENTS

When a patch is applied, a `patch` event is emitted on the `window` object of the page,
you can use this event to do additional domain specific processing.

### LIVE RENDERING REACT

For example, you could re-render your react application or component

```
window.addEventListener('patch', function(event) {
  React.render(app);
});
```

### LIVE RENDERING MITHRIL

Re-rendering mithril applications is essentially identical.

```
window.addEventListener('patch', function(event) {
  Mithril.render();
});
```

### INTERACTIVE MODE

To edit the **present** state, you can use the `--interactive` option,
which will start a `read-eval-print-loop` in the terminal.

```js
$ amok --interactive about:blank
```

## MONITORING THE FILE SYSTEM

### FILE SYSTEM NOTIFICATIONS

If you pass `--watch` to amok, it will monitor the working directory and dispatch events on the window object when files are added,
changed or removed. If you give it a glob pattern only files matching that pattern will be watched.

```sh
$ amok --watch about:blank
```

### FILE SYSTEM EVENTS

When a change in the file system is detected, an `add`, `change` or `unlink` event is dispatched on the `window` object of the page.

```js
window.on('add', function(event) {
  console.log('%s added', event.detail.filename);
});

window.on('change', function(event) {
  console.log('%s changed', event.detail.filename);
});

window.on('unlink', function(event) {
  console.log('%s removed', event.detail.filename);
});
```

### LIVE RELOADING CSS

You could for example listen to the `change` event and reload css files as they change.

```js
window.addEventListener('change', function(event) {
  var filename = event.detail.filename;
  if (filename.match(/.css$/) {
    var link = document.querySelector('link[href*="'+ filename + '"]');
    link.href = event.detail.filename + '?' + performance.now();
  }
});
```

### LIVE RELOADING IMAGES

You could also do the same and listen for `change` events to reload image files as they change.

```js
window.addEventListener('change', function(event) {
  var filename = event.detail.filename;
  if (filename.match(/(.jpg|.png|.webm)$/) {
    var imgs = document.querySelectorAll('img[src*="'+ filename + '"]');

    [].forEach.apply(imgs, function(img) {
      img.src = event.detail.filename + '?' + performance.now();
    });
  }
});
```
