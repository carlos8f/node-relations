describe('admin role (array syntax)', function () {
  before(function () {
    //var redis = require('redis');
    //relations.use(relations.stores.redis, {client: redis.createClient()});
    relations.define('users');
    relations.users.addRole('admin', ['do stuff']);
  });

  after(relations.tearDown);

  it('is carlos an admin', function (done) {
    relations.users('is %s an %s of %s?', ['carlos', 'admin', 'whoville'], function (err, is) {
      assert.ifError(err);
      assert(!is);
      done();
    });
  });

  it('carlos is an admin', function (done) {
    relations.users('%s is an %s of %s', ['carlos', 'admin', 'whoville'], function (err) {
      assert.ifError(err);
      done();
    });
  });

  it('is carlos an admin', function (done) {
    relations.users('is %s an %s of %s?', ['carlos', 'admin', 'whoville'], function (err, is) {
      assert.ifError(err);
      assert(is);
      done();
    });
  });

  it('carlos is not admin', function (done) {
    relations.users('%s is not an %s of %s', ['carlos', 'admin', 'whoville'], function (err) {
      assert.ifError(err);
      done();
    });
  });

  it('is carlos an admin', function (done) {
    relations.users('is %s an %s of %s?', ['carlos', 'admin', 'whoville'], function (err, is) {
      assert.ifError(err);
      assert(!is);
      done();
    });
  });
});

describe('admin role (object syntax)', function () {
  before(function () {
    //var redis = require('redis');
    //relations.use(relations.stores.redis, {client: redis.createClient()});
    relations.define('users');
    relations.users.addRole('admin', ['do stuff']);
  });

  after(relations.tearDown);

  it('is carlos an admin', function (done) {
    relations.users('is :user a :role of :object?', {user: 'carlos', role: 'admin', object: 'whoville'}, function (err, is) {
      assert.ifError(err);
      assert(!is);
      done();
    });
  });

  it('carlos is an admin', function (done) {
    relations.users(':user is a :role of :object', {user: 'carlos', role: 'admin', object: 'whoville'}, function (err) {
      assert.ifError(err);
      done();
    });
  });

  it('is carlos an admin', function (done) {
    relations.users('is :user a :role of :object?', {user: 'carlos', role: 'admin', object: 'whoville'}, function (err, is) {
      assert.ifError(err);
      assert(is);
      done();
    });
  });

  it('carlos is not admin', function (done) {
    relations.users(':user is not a :role of :object', {user: 'carlos', role: 'admin', object: 'whoville'}, function (err) {
      assert.ifError(err);
      done();
    });
  });

  it('is carlos an admin', function (done) {
    relations.users('is :user a :role of :object?', {user: 'carlos', role: 'admin', object: 'whoville'}, function (err, is) {
      assert.ifError(err);
      assert(!is);
      done();
    });
  });
});

describe('admin role (literal syntax)', function () {
  before(function () {
    //var redis = require('redis');
    //relations.use(relations.stores.redis, {client: redis.createClient()});
    relations.define('users');
    relations.users.addRole('admin', ['do stuff']);
  });

  after(relations.tearDown);

  it('is carlos an admin', function (done) {
    relations.users('is carlos an admin of whoville', function (err, is) {
      assert.ifError(err);
      assert(!is);
      done();
    });
  });

  it('carlos is an admin', function (done) {
    relations.users('carlos is an admin of whoville', function (err) {
      assert.ifError(err);
      done();
    });
  });

  it('is carlos an admin', function (done) {
    relations.users('is carlos an admin of whoville', function (err, is) {
      assert.ifError(err);
      assert(is);
      done();
    });
  });

  it('carlos is not admin', function (done) {
    relations.users('carlos is not an admin of whoville', function (err) {
      assert.ifError(err);
      done();
    });
  });

  it('is carlos an admin', function (done) {
    relations.users('is carlos an admin of whoville', function (err, is) {
      assert.ifError(err);
      assert(!is);
      done();
    });
  });
});
