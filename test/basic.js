describe('memory store', function () {
  doBasicTest();
});

describe('mysql store', function () {
  var mysql = require('mysql');
  doBasicTest('mysql', {client: mysql.createConnection({user: 'root', database: 'test'})});
});

describe('redis store', function () {
  var redis = require('redis');
  doBasicTest('redis', {client: redis.createClient(), prefix: 'relations-test:test-prefix'});
});

describe('mongoose store', function () {
    var mongoose = require('mongoose');
    mongoose.connect('mongodb://127.0.0.1/relations_test');
    doBasicTest('mongoose');
});