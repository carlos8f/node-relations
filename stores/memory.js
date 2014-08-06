var store = module.exports = require('eventflow')();
var contexts = store._contexts = {};
var fs = require('fs');

store.on('init', function (options, cb) {
  store._save = function (cb) {
    if (!options.dataFile) return cb();
    fs.writeFile(options.dataFile, JSON.stringify(contexts, null, 2), cb);
  };
  if (options.dataFile) {
    fs.readFile(options.dataFile, {encoding: 'utf8'}, function (err, raw) {
      if (raw) contexts = JSON.parse(raw);
      cb();
    });
  }
  else cb();
});

function initSubject (cmd) {
  contexts[cmd.ctx.name] || (contexts[cmd.ctx.name] = {});
  return contexts[cmd.ctx.name][cmd.subject] || (contexts[cmd.ctx.name][cmd.subject] = {
    objects: {},
    roles: {}
  });
}

store.on('declaration', function (cmd, cb) {
  var subject = initSubject(cmd);
  if (cmd.object) {
    subject.objects[cmd.object] || (subject.objects[cmd.object] = {});
    subject.objects[cmd.object][cmd.role] = true;
  }
  else {
    subject.roles[cmd.role] = true;
  }
  store._save(cb);
});

store.on('revocation', function (cmd, cb) {
  var subject = initSubject(cmd);
  if (cmd.object && subject.objects[cmd.object]) {
    delete subject.objects[cmd.object][cmd.role];
  }
  else {
    delete subject.roles[cmd.role];
  }
  store._save(cb);
});

store.on('verb-question', function (cmd, cb) {
  var subject = initSubject(cmd);
  var can = Object.keys(subject.roles).some(function (role) {
    return cmd.ctx.verbs[cmd.verb] && ~cmd.ctx.verbs[cmd.verb].indexOf(role);
  });
  if (!can && cmd.object && subject.objects[cmd.object]) {
    can = Object.keys(subject.objects[cmd.object]).some(function (role) {
      return cmd.ctx.verbs[cmd.verb] && ~cmd.ctx.verbs[cmd.verb].indexOf(role);
    });
  }
  cb(null, can);
});

store.on('role-question', function (cmd, cb) {
  var subject = initSubject(cmd);
  var is = subject.roles[cmd.role];
  if (!is && cmd.object && subject.objects[cmd.object]) {
    is = Object.keys(subject.objects[cmd.object]).some(function (role) {
      return role === cmd.role;
    });
  }
  cb(null, is);
});

store.on('verb-request', function (cmd, cb) {
  var subject = initSubject(cmd);
  cb(null, Object.keys(subject.objects).filter(function (k) {
    return Object.keys(subject.objects[k]).some(function (role) {
      return cmd.ctx.verbs[cmd.verb] && ~cmd.ctx.verbs[cmd.verb].indexOf(role);
    });
  }));
});

store.on('role-request', function (cmd, cb) {
  var subject = initSubject(cmd);
  cb(null, Object.keys(subject.objects).filter(function (k) {
    return subject.objects[k][cmd.role];
  }));
});

store.on('verb-subject-request', function (cmd, cb) {
  contexts[cmd.ctx.name] || (contexts[cmd.ctx.name] = {});
  cb(null, Object.keys(contexts[cmd.ctx.name]).filter(function (subject) {
    subject = contexts[cmd.ctx.name][subject];
    if (!subject.objects[cmd.object]) return false;
    return Object.keys(subject.objects[cmd.object]).some(function (role) {
      return cmd.ctx.verbs[cmd.verb] && ~cmd.ctx.verbs[cmd.verb].indexOf(role);
    });
  }));
});

store.on('role-subject-request', function (cmd, cb) {
  contexts[cmd.ctx.name] || (contexts[cmd.ctx.name] = {});
  cb(null, Object.keys(contexts[cmd.ctx.name]).filter(function (subject) {
    subject = contexts[cmd.ctx.name][subject];
    if (!subject.objects[cmd.object]) return false;
    return subject.objects[cmd.object][cmd.role];
  }));
});

store.on('object-verb-request', function (cmd, cb) {
  var subject = initSubject(cmd)
    , object = subject.objects[cmd.object] || {};
  cb(null, Object.keys(object).reduce(function (verbs, role) {
    return verbs.concat( cmd.ctx.roles[role] || [] );
  }, []));
});

store.on('object-role-map-request', function (cmd, cb) {
  var subject = initSubject(cmd);
  var map = {};
  map[''] = Object.keys(subject.roles || {}).filter(function (role) {
    return subject.roles[role];
  });
  cb(null, Object.keys(subject.objects || {}).reduce(function (map, object) {
    var roles = Object.keys(subject.objects[object] || {}).filter(function (role) {
      return subject.objects[object][role];
    });
    if (roles.length) map[object] = roles;
    return map;
  }, map));
});

store.on('subject-role-map-request', function (cmd, cb) {
  var subjects = Object.keys(contexts[cmd.ctx.name] || {});
  cb(null, subjects.reduce(function (map, subjectName) {
    var subject = initSubject({ subject: subjectName, ctx: cmd.ctx })
      , roles;
    if (cmd.object) {
      var object = (subject.objects || {})[cmd.object] || {};
      roles = Object.keys(object).filter(function (role) {
        return object[role];
      });
    }
    else {
      roles = Object.keys(subject.roles || {}).filter(function (role) {
        return subject.roles[role];
      });
    }
    if (roles.length) map[subjectName] = roles;
    return map;
  }, {}));
});
