var store = module.exports = require('eventflow')();
var mongoose = require('mongoose');
var RelationSchema = require('./mongoose/schema');
var Relation;
var client;

function buildObject(cmd) {
  return {
    context: cmd.ctx.name,
    subject: cmd.subject,
    role: cmd.role,
    object: cmd.object || ""
  };
};

function getQuestionHandler(cb) {
  return function(err, count) {
    if (err) {
        cb(err);
    } else {
        cb(null, count > 0);
    }
  };
};

function getRequestHandler(field, cb) {
  return function(err, result) {
    if (err) {
        cb(err);
    } else {
      // The cb expects an array that contains only the given field
      // Remove dublicated entries here, because in mongoose select and distinct cannot be combined
      var filtered = filter(result, field);
      cb(null, filtered);
    }
  };
};

function filter(toFilter, field) {
  return toFilter.map(function(doc){
      return doc[field];
  });
};


store.on('init', function (options, cb) {
  if (!options.client) {
    return cb(new Error('must pass a mongoose connection in options.client to use mongoose store'));
  }
  client = store._client = options.client;

  if (client.readyState === mongoose.Connection.STATES.connected) {
    Relation = client.model('Relation', RelationSchema);
    return cb(null);
  } else {
    return cb(new Error('must pass a valid mongoose connection in options.client to use mongoose store'));
  }
});

store.on('declaration', function (cmd, cb) {
  (new Relation(buildObject(cmd)))
    .save(function(err, newRelation) {
      cb(err);
  });
});

store.on('revocation', function (cmd, cb) {
  Relation.remove(buildObject(cmd), cb);
});

store.on('verb-question', function (cmd, cb) {

  var object = [''];
  if (cmd.object) {
    object.push(cmd.object);
  }

  var query = {
    context: cmd.ctx.name,
    subject: cmd.subject,
    role: {
        $in: cmd.ctx.verbs[cmd.verb]
    },
    object: {
        $in: object
    }
  };

  Relation.count(query, getQuestionHandler(cb));
});

store.on('role-question', function (cmd, cb) {

  var object = [''];
  if (cmd.object) {
    object.push(cmd.object);
  }

  var query = {
    context: cmd.ctx.name,
    subject: cmd.subject,
    role: cmd.role,
    object: {
        $in: object
    }
  };

  Relation.count(query, getQuestionHandler(cb));
});

store.on('verb-request', function (cmd, cb) {

  var query = {
    context: cmd.ctx.name,
    subject: cmd.subject,
    role: {
        $in: cmd.ctx.verbs[cmd.verb]
    },
    object: {
        $ne: ''
    }
  };

  var field = 'object';

  Relation.find(query, field, getRequestHandler(field, cb));

});

store.on('role-request', function (cmd, cb) {

  var query = {
    context: cmd.ctx.name,
    subject: cmd.subject,
    role: cmd.role,
    object: {
        $ne: ''
    }
  };

  var field = 'object';

  Relation.find(query, field, getRequestHandler(field, cb));

});

store.on('verb-subject-request', function (cmd, cb) {

  var query = {
    context: cmd.ctx.name,
    role: {
        $in: cmd.ctx.verbs[cmd.verb]
    },
    object: cmd.object
  };

  var field = 'subject';

  Relation.find(query, field, getRequestHandler(field, cb));

});

store.on('role-subject-request', function (cmd, cb) {

  var query = {
    context: cmd.ctx.name,
    role: cmd.role,
    object: cmd.object
  };

  var field = 'subject';

  Relation.find(query, field, getRequestHandler(field, cb));

});

store.on('object-verb-request', function (cmd, cb) {

  var query = {
    context: cmd.ctx.name,
    subject: cmd.subject,
    object: cmd.object
  };

  var field = 'role';

  Relation.find(query, field, function (err, result) {
    if (err) {
      cb(err);
    } else {
      var reduced = filter(result, field).reduce(function (verbs, role) {
        return verbs.concat( cmd.ctx.roles[role] || [] );
      }, []);
      cb(null, reduced);
    }
  });

});

store.on('object-role-map-request', function (cmd, cb) {

  var query = {
    context: cmd.ctx.name,
    subject: cmd.subject
  };

  var field = 'object role';

  Relation.find(query, field, function (err, result) {
    if (err) {
      cb(err);
    } else {
      var reduced = result.reduce(function (map, doc) {
        map[doc.object] || (map[doc.object] = []);
        map[doc.object].push(doc.role);
        return map;
      }, {});
      cb(null, reduced);
    }
  });
});

store.on('subject-role-map-request', function (cmd, cb) {

  var query = {
    context: cmd.ctx.name,
    object: cmd.object || ''
  };

  var field = 'subject role';

  Relation.find(query, field, function (err, result) {
    if (err) {
      cb(err);
    } else {
      var reduced = result.reduce(function (map, doc) {
        map[doc.subject] || (map[doc.subject] = []);
        map[doc.subject].push(doc.role);
        return map;
      }, {});
      cb(null, reduced);
    }
  });
});

store.on('reset', function (cb) {
  Relation.remove({}, cb);
});
