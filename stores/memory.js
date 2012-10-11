var store = module.exports = require('eventflow')();

var entities = {};

function initSubject (subject) {
  entities[subject] || (entities[subject] = {
    objects: {},
    roles: {}
  });
  return entities[subject];
}

store.on('declaration', function (cmd, cb) {
  var subject = initSubject(cmd.subject);
  if (cmd.object) {
    subject.objects[cmd.object] || (subject.objects[cmd.object] = {});
    subject.objects[cmd.object][cmd.role] = true;
  }
  else {
    subject.roles[cmd.role] = true;
  }
  cb();
});

store.on('revocation', function (cmd, cb) {
  var subject = initSubject(cmd.subject);
  if (cmd.object && subject.objects[cmd.object]) {
    delete subject.objects[cmd.object][cmd.role];
  }
  else {
    delete subject.roles[cmd.role];
  }
  cb();
});

store.on('verb-question', function (cmd, cb) {
  var subject = initSubject(cmd.subject);
  var can = Object.keys(subject.roles).some(function (role) {
    return ~cmd.ctx.verbs[cmd.verb].indexOf(role);
  });
  if (!can && cmd.object && subject.objects[cmd.object]) {
    can = Object.keys(subject.objects[cmd.object]).some(function (role) {
      return ~cmd.ctx.verbs[cmd.verb].indexOf(role);
    });
  }
  cb(null, can);
});

store.on('role-question', function (cmd, cb) {
  var subject = initSubject(cmd.subject);
  var can = Object.keys(subject.roles).some(function (role) {
    return role === cmd.role;
  });
  if (!can && cmd.object && subject.objects[cmd.object]) {
    can = Object.keys(subject.objects[cmd.object]).some(function (role) {
      return role === cmd.role;
    });
  }
  cb(null, can);
});

store.on('verb-request', function (cmd, cb) {
  var subject = initSubject(cmd.subject);
  cb(null, Object.keys(subject.objects).filter(function (k) {
    return Object.keys(subject.objects[k]).some(function (role) {
      return ~cmd.ctx.verbs[cmd.verb].indexOf(role);
    });
  }));
});

store.on('role-request', function (cmd, cb) {
  var subject = initSubject(cmd.subject);
  cb(null, Object.keys(subject.objects).filter(function (k) {
    return subject.objects[k][cmd.role];
  }));
});

store.emit('ready');