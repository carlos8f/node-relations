describe('basic test', function () {
  doBasicTest();
});

describe('mysql', function () {
  var mysql = require('mysql');
  doBasicTest('mysql', {client: mysql.createConnection({user: 'root', database: 'test'})});
});

describe('redis', function () {
  var redis = require('redis');
  doBasicTest('redis', {client: redis.createClient()});
});