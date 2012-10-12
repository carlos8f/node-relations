describe('basic test', function () {
  doBasicTest();
});
describe('mysql', function () {
  var mysql = require('mysql');
  doBasicTest('mysql', {client: mysql.createConnection({user: 'root', database: 'test'})});
});