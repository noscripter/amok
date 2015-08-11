# CHANGELOG

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## 1.1.0 - 2014-08-11
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

## 1.0.0 - 2014-07-14
