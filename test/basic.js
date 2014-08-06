describe('memory store', function () {
  doBasicTest();
});

describe('mysql store', function () {
  var mysql = require('mysql');
  doBasicTest('mysql', {database: 'relations_test', client: mysql.createConnection({user: 'root'})});
});

describe('redis store', function () {
  var redis = require('redis');
  doBasicTest('redis', {client: redis.createClient(), prefix: 'relations-test:test-prefix'});
});
