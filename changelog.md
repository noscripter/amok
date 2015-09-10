---
---

# CHANGELOG

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## 1.1.2 - 2015-08-13
### FIXED

- Fixed an issue with the multiplexer where targets would be given
the upstream `webSocketDebuggerUrl`

### CHANGED

- Changed the default `port` option value to be 9222 and the default
`debug-port` option value to be 9223.

## 1.1.1 - 2015-08-12
### FIXED

- Fixed an issue where peer connections would not close when an upstream
connection was closed in the multiplexer.

- Fixed an issue where non-connectable targets would be given a
`webSocketDebuggerUrl`.

- Fixed an issue with the multiplexer where state would persist after the
upstream connection closed which would prevent reconnections.

## 1.1.0 - 2015-08-11
### ADDED

- Added protocol multiplexing, the new `port` and `host` options define
the address the multiplexer is accepting incoming connections on. The internal client connection is done through the multiplexer allowing shared connections with external tools like Chrome Developer Tools or Firefox Developer Tools.

### CHANGED

- Changed how function names are reported when evaluating them in interactive mode
(e.g `[Function: setTimeout]` which would previously be reported as `[Function]`).

- Changed child processes to write diagnostic information on standard error,
previously it was written to both standard output and standard error.

### FIXED

- Fixed an issue where errors from interactive mode input would be reported as `[Object]`.

## 1.0.0 - 2015-07-14
