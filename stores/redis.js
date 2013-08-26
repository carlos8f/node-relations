var store = module.exports = require('eventflow')();
var client;
var async = require('async');

store.on('init', function (options, cb) {
  if (!options.client) {
    return cb(new Error('must pass a node_redis client in options.client to use redis store'));
  }
  client = store._client = options.client;
  if (client.connected) return cb();
  else client.once('ready', cb);
});

function getKey (cmd) {
  return [
    'relations',
    cmd.ctx.name,
    cmd.subject,
    cmd.object || all
  ].join(':');
}

var all = '__all__';

store.on('declaration', function (cmd, cb) {
  client.SADD(getKey(cmd), cmd.role, cb);
});

store.on('revocation', function (cmd, cb) {
  client.SREM(getKey(cmd), cmd.role, cb);
})

store.on('verb-question', function (cmd, cb) {
  (function doCheck () {
    client.SMEMBERS(getKey(cmd), function (err, roles) {
      if (err) return cb(err);
      if (!roles) roles = []; 
      var can = roles.some(function (role) {
        return cmd.ctx.verbs[cmd.verb] && ~cmd.ctx.verbs[cmd.verb].indexOf(role);
      });
      if (can || !cmd.object) return cb(null, can);
      else {
        delete cmd.object;
        doCheck();
      }
    });
  })();
});

store.on('role-question', function (cmd, cb) {
  (function doCheck () {
    client.SMEMBERS(getKey(cmd), function (err, roles) {
      if (err) return cb(err);
      if (!roles) roles = [];
      var can = !!~roles.indexOf(cmd.role);
      if (can || !cmd.object) return cb(null, can);
      else {
        delete cmd.object;
        doCheck();
      }
    });
  })();
});

store.on('verb-request', function (cmd, cb) {
  client.KEYS([
    'relations',
    cmd.ctx.name,
    cmd.subject,
    '*'
  ].join(':'), function (err, keys) {
    if (err || !keys) return cb(err, []);
    async.map(keys, function (key, cb_) {
      client.SMEMBERS(key, function (err, roles) {
        var object = key.split(':').pop();
        if (err || !roles || object == all) return cb_(err);
        cb_(null, roles.some(function (role) {
          return cmd.ctx.verbs[cmd.verb] && ~cmd.ctx.verbs[cmd.verb].indexOf(role);
        }) ? object : null);
      });
    }, function (err, objects) {
      if (err) return cb(err);
      cb(null, objects.filter(function (object) {
        return !!object;
      }));
    });
  });
});

store.on('role-request', function (cmd, cb) {
  client.KEYS([
    'relations',
    cmd.ctx.name,
    cmd.subject,
    '*'
  ].join(':'), function (err, keys) {
    if (err || !keys) return cb(err, []);
    async.map(keys, function (key, cb_) {
      client.SMEMBERS(key, function (err, roles) {
        var object = key.split(':').pop();
        if (err || !roles || object === all) return cb_(err);
        cb_(null, ~roles.indexOf(cmd.role) ? object : null);
      });
    }, function (err, objects) {
      if (err) return cb(err);
      cb(null, objects.filter(function (object) {
        return !!object;
      }));
    });
  });
});

store.on('verb-subject-request', function (cmd, cb) {
  client.KEYS([
    'relations',
    cmd.ctx.name,
    '*',
    cmd.object
  ].join(':'), function (err, keys) {
    if (err || !keys) return cb(err, []);
    async.map(keys, function (key, cb_) {
      client.SMEMBERS(key, function (err, roles) {
        var subject = key.split(':').slice(2, 3)[0];
        if (err ) return cb_(err);
        cb_(null, roles.some(function (role) {
          return cmd.ctx.verbs[cmd.verb] && ~cmd.ctx.verbs[cmd.verb].indexOf(role);
        }) ? subject : null);
      });
    }, function (err, subjects) {
      if (err) return cb(err);
      cb(null, subjects.filter(function (subjects) {
        return !!subjects;
      }));
    });
  });
});

store.on('role-subject-request', function (cmd, cb) {
  client.KEYS([
    'relations',
    cmd.ctx.name,
    '*',
    cmd.object
  ].join(':'), function (err, keys) {
    if (err || !keys) return cb(err, []);
    async.map(keys, function (key, cb_) {
      client.SMEMBERS(key, function (err, roles) {
        var subject = key.split(':').slice(2, 3)[0];
        if (err) return cb_(err);
        cb_(null, ~roles.indexOf(cmd.role) ? subject : null);
      });
    }, function (err, subjects) {
      if (err) return cb(err);
      cb(null, subjects.filter(function (subjects) {
        return !!subjects;
      }));
    });
  });
});

store.on('object-verb-request', function (cmd, cb) {
  client.SMEMBERS(getKey(cmd), function (err, roles) {
    if (err) return cb(err);
    if (!roles) roles = [];
    cb(null, roles.reduce(function (verbs, role) {
      return verbs.concat( cmd.ctx.roles[role] || [] );
    }, []));
  });
});

store.on('reset', function (cb) {
  client.KEYS('relations:*', function (err, keys) {
    if (err || !keys) return cb(err);
    async.map(keys, client.DEL.bind(client), cb);
  });
});