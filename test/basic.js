describe('basic test', function () {
  var carlos = 'carlos8f'
    , brian = 'cpsubrian'
    , sagar = 'astrosag_ngc4414'

  // repos
  var buffet = 'carlos8f/node-buffet'
    , views = 'cpsubrian/node-views'

  before(function () {
    relations.define('repos', {
      owner: ['pull', 'push', 'administrate'],
      collaborator: ['pull', 'push'],
      watcher: ['pull']
    });

    relations.repos('%s is the owner of %s', carlos, buffet);
    relations.repos('%s is a collaborator of %s', carlos, views);
    relations.repos('%s is a watcher', carlos);
    relations.repos('%s is an owner of %s', brian, views);
    relations.repos('%s is a watcher', brian);
    relations.repos('%s is a watcher', sagar);
  });

  it('can brian administrate views (named tokens)', function (done) {
    relations.repos('can :user administrate :repo', {user: brian, repo: views}, function (err, can) {
      assert.ifError(err);
      assert(can);
      done();
    });
  });

  it('can carlos push to views', function (done) {
    relations.repos('can %s push to %s', carlos, views, function (err, can) {
      assert.ifError(err);
      assert(can);
      done();
    });
  });

  it('can sagar pull from views', function (done) {
    relations.repos('can %s pull from %s', sagar, views, function (err, can) {
      assert.ifError(err);
      assert(can);
      done();
    });
  });

  it('can sagar pull', function (done) {
    relations.repos('can %s pull', sagar, function (err, can) {
      assert.ifError(err);
      assert(can);
      done();
    });
  });

  it('is brian a collaborator of buffet', function (done) {
    relations.repos('is %s a collaborator of %s', brian, buffet, function (err, is) {
      assert.ifError(err);
      assert(!is);
      done();
    });
  });

  it('is sagar a watcher', function (done) {
    relations.repos('is %s a watcher', sagar, function (err, is) {
      assert.ifError(err);
      assert(is);
    });
  });
  
  it('what can carlos pull from', function (done) {
    relations.repos('what can %s pull from', carlos, function (err, list) {
      assert.ifError(err);
      assert.deepEqual(list, [buffet, views]);
      done();
    });
  });

  it('brian can administrate what', function (done) {
    relations.repos('%s can administrate what', brian, function (err, list) {
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

  it('carlos is not a collaborator of views', function (done) {
    relations.repos('%s is not a collaborator of %s', carlos, views);
    relations.repos('can %s push to %s', carlos, views, function (can) {
      assert(!can);
      done();
    });
  });
});