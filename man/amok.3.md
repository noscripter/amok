## NAME

amok -- browser development workflow framework

## SYNOPSIS

```js
require('amok')
```

## METHODS

[`amok.Runner`](amok.Runner.3.md)
:   Runner

[`amok.createRunner`](amok.createRunner.3.md)
:   Creates an `amok.Runner` object.

[`amok.browser`](amok.browser.3.md)
:   Middleware for opening a browser.

[`amok.compiler`](amok.compiler.3.md)
:   Middleware for watching and incrementally preprocessing scripts with a compiler.

[`amok.hotpatch`](hotpatch.3.md)
:   Middleware for monitoring script sources and hot patching active scripts.

[`amok.print`](amok.print.3.md)
:   Middleware for redirecting the client's console to a readable stream.

[`amok.repl`](amok.repl.3.md)
:   Middleware for creating a read-eval-print-loop.

[`amok.server`](amok.server.3.md)
:   Middleware for starting a http development server.

[`amok.watch`](amok.watch.3.md)
:   Middleware for monitoring files matching a pattern.

## DESCRIPTION

Use `require('amok') to use this module.