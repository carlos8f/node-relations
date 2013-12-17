describe.skip('memory store', function () {
  doBasicTest();
});

describe.skip('mysql store', function () {
  var mysql = require('mysql');
  doBasicTest('mysql', {client: mysql.createConnection({user: 'root', database: 'test'})});
});

describe.skip('redis store', function () {
  var redis = require('redis');
  doBasicTest('redis', {client: redis.createClient(6379, '95.168.218.4'), prefix: 'relations-test:test-prefix'});
});

describe('mongoose store', function () {
    var mongoose = require('mongoose');
    mongoose.connect('mongodb://95.168.218.4/ripple_engine_t');
    doBasicTest('mongoose');
});