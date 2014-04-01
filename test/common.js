assert = require('assert');

util = require('util');

relations = require('../');

doBasicTest = function (store, options) {
  var carlos = 'carlos8f'
    , brian = 'cpsubrian'
    , sagar = 'astrosag_ngc4414'

  // repos
  var buffet = 'carlos8f/node-buffet'
    , views = 'cpsubrian/node-views'

  before(function () {
    if (store) {
      relations.use(relations.stores[store], options);
    }
    relations.define('repos');
    relations.repos.addRole('owner', ['pull', 'push', 'administrate']);
    relations.repos.addRole('collaborator', ['pull', 'push']);
    relations.repos.addRole('watcher', ['pull']);

    relations.repos('%s is the owner of %s', carlos, buffet);
    relations.repos('%s is a collaborator of %s', carlos, views);
    relations.repos('%s is a watcher', carlos);
    relations.repos(':user is the "owner" of :repo', {user: brian, repo: views});
    relations.repos('%s is a watcher', brian);
    relations.repos('%s is a watcher', sagar);

  });

  after(relations.tearDown);

  it('can brian administrate views', function (done) {
    relations.repos('can :user administrate :repo?', {user: brian, repo: views}, function (err, can) {
      assert.ifError(err);
      assert(can);
      done();
    });
  });

  it('can carlos push to views', function (done) {
    relations.repos('can %s push to %s', [carlos, views], function (err, can) {
      assert.ifError(err);
      assert(can);
      done();
    });
  });

  it('can sagar pull from views', function (done) {
    relations.repos('can %s pull from cpsubrian/node-views?', sagar, function (err, can) {
      assert.ifError(err);
      assert(can);
      done();
    });
  });

  it('can sagar pull', function (done) {
    relations.repos('can %s pull?', sagar, function (err, can) {
      assert.ifError(err);
      assert(can);
      done();
    });
  });

  it('is brian a collaborator of buffet', function (done) {
    relations.repos('is %s a collaborator of "' + buffet + '"?', brian, function (err, is) {
      assert.ifError(err);
      assert(!is);
      done();
    });
  });

  it('is sagar a watcher', function (done) {
    relations.repos('is ' + sagar + ' a watcher?', function (err, is) {
      assert.ifError(err);
      assert(is);
      done();
    });
  });

  it('what can carlos pull from', function (done) {
    relations.repos('what can %s pull from?', carlos, function (err, list) {
      assert.ifError(err);
      assert.deepEqual(list.sort(), [buffet, views].sort());
      done();
    });
  });

  it('what can brian administrate', function (done) {
    relations.repos('what can %s administrate', brian, function (err, list) {
      assert.ifError(err);
      assert.deepEqual(list, [views]);
      done();
    });
  });

  it('what can sagar pull from', function (done) {
    relations.repos('what can %s pull from', sagar, function (err, list) {
      assert.ifError(err);
      assert.deepEqual(list, []);
      done();
    });
  });

  it('what is carlos a collaborator of', function (done) {
    relations.repos('what is %s a collaborator of', carlos, function (err, list) {
      assert.ifError(err);
      assert.deepEqual(list, [views]);
      done();
    });
  });

  it('what roles does brian have in views', function (done) {
      relations.repos('what roles does %s have in %s', brian, views, function (err, list) {
          assert.ifError(err);
          assert.deepEqual(list.sort(), [ 'owner' ]);
          done();
      });
  });

  it('who is the owner of views?', function (done) {
    relations.repos('who is the owner of %s?', views, function (err, list) {
      assert.ifError(err);
      assert.deepEqual(list, [brian]);
      done();
    });
  });

  it('who can pull from views?', function (done) {
    relations.repos('who can pull from %s?', views, function (err, list) {
      assert.ifError(err);
      assert.deepEqual(list.sort(), [carlos, brian]);
      done();
    });
  });

  it('carlos is not a collaborator of views', function (done) {
    relations.repos('%s is not a collaborator of %s', [carlos, views]);
    relations.repos('can %s push to %s', carlos, views, function (can) {
      assert(!can);
      done();
    });
  });

  it('add owner role throws', function (done) {
    assert.throws(function () {
      relations.repos.addRole('owner', ['pull', 'push', 'administrate']);
    }, function (err) {
      return err.code === 'ER_DUP_ROLE';
    });
    done();
  });

  it('redefine owner', function (done) {
    relations.repos.updateRole('owner', ['pull', 'push', 'administrate', 'absquatulate']);
    done();
  });

  it('can carlos absquatulate buffet?', function (done) {
    relations.repos('can %s absquatulate %s?', carlos, buffet, function (err, can) {
      assert.ifError(err);
      assert(can);
      done();
    });
  });

  it('what can carlos absquatulate?', function (done) {
    relations.repos('what can %s absquatulate?', carlos, function (err, list) {
      assert.ifError(err);
      assert.deepEqual(list [buffet]);
      done();
    });
  });

  it('can brian absquatulate buffet?', function (done) {
    relations.repos('can %s absquatulate %s?', brian, buffet, function (err, can) {
      assert.ifError(err);
      assert(!can);
      done();
    });
  });

  it('add scientist', function (done) {
    relations.repos.addRole('scientist', ['test']);
    relations.repos('%s is a scientist', sagar, done);
  });

  it('can sagar test views?', function (done) {
    relations.repos('can %s test %s?', sagar, views, function (err, can) {
      assert.ifError(err);
      assert(can);
      done();
    });
  });

  it('can brian test views?', function (done) {
    relations.repos('can %s test %s?', brian, views, function (err, can) {
      assert.ifError(err);
      assert(!can);
      done();
    });
  });

  it('remove scientist', function (done) {
    relations.repos.removeRole('scientist');
    done();
  });

  it('can sagar test views?', function (done) {
    relations.repos('can %s test %s?', sagar, views, function (err, can) {
      assert(err);
      assert.equal(err.message, 'verb not defined: "test"');
      done();
    });
  });

  it('what roles can absquatulate?', function (done) {
    var roles = relations.repos.getRoles('absquatulate');
    assert(roles);
    assert.equal(roles.length, 1);
    assert.equal(roles[0], 'owner');
    done();
  });

  it('what actions can carlos do with buffet', function (done) {
    relations.repos('what actions can %s do with %s?', carlos, buffet, function (err, verbs) {
      assert.ifError(err);
      assert.equal(verbs.length, 4);
      assert.equal(verbs[0], 'pull');
      assert.equal(verbs[1], 'push');
      assert.equal(verbs[2], 'administrate');
      done();
    });
  });

  it('who can administrate buffet', function (done) {
    relations.repos('who can administrate %s', buffet, function (err, list) {
      assert.ifError(err);
      assert.deepEqual(list, [carlos]);
      done();
    });
  });
}