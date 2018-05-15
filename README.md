# Express API example

This is an example of nodejs API using Express, cluster, domain and request-promise. It handles to manage well nodejs server's errors.

## Requirements
* `touch /logs/errors.txt`
* `touch /logs/check_execution.txt`

### Packages
* cluster
* fs
* path
* express
* request-promise
* domain

## launch Express with outputs

`nodejs app.js 1> std.out 2> err.out`