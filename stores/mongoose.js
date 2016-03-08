'use strict';

var store = module.exports = require('eventflow')();
var Relation = require('../mongoose_relation_model');

store.on('init', function (options, cb) {
  cb();
});

store.on('declaration', function (cmd, cb) {
  var query = {
    context: cmd.ctx.name,
    subject: cmd.subject,
    role: cmd.role,
    object: cmd.object || ''
  };
  Relation.findOneAndUpdate(query, query, {new: true, upsert: true}, function (err, doc) {
    cb(err);
  });
});

store.on('revocation', function (cmd, cb) {
  var query = {
    context: cmd.ctx.name,
    subject: cmd.subject,
    role: cmd.role,
    object: cmd.object || ''
  };
  Relation.findOneAndRemove(query, function (err, doc) {
    cb(err);
  });
});

store.on('verb-question', function (cmd, cb) {
  var query = {
    context: cmd.ctx.name,
    subject: cmd.subject,
    role: cmd.ctx.verbs[cmd.verb]
  };
  Relation.findOne(query).where('object').in([cmd.object || '', '']).exec(function (err, row) {
    if (err) return cb(err);
    cb(null, !!row);
  });
  /*  client.query("SELECT 1 FROM `relations`"
   + " WHERE `context` = ?"
   + " AND `subject` = ?"
   + " AND `role` IN (?)"
   + " AND (`object` = ? || `object` = '')", [cmd.ctx.name, cmd.subject, cmd.ctx.verbs[cmd.verb], cmd.object || ""], */
});

store.on('role-question', function (cmd, cb) {
  var query = {
    context: cmd.ctx.name,
    subject: cmd.subject,
    role: cmd.role
  };
  Relation.findOne(query).where('object').in([cmd.object || '', '']).exec(function (err, row) {
    if (err) return cb(err);
    cb(null, !!row);
  });
  /*
   client.query("SELECT 1 FROM `relations`"
   + " WHERE `context` = ?"
   + " AND `subject` = ?"
   + " AND `role` = ?"
   + " AND (`object` = ? || `object` = '')", [cmd.ctx.name, cmd.subject, cmd.role, cmd.object || ""], function (err, rows) {
   if (err) return cb(err);
   cb(null, !!rows[0]);
   });
   */
});

store.on('verb-request', function (cmd, cb) {
  /*  client.query("SELECT `object` FROM `relations`"
   + " WHERE `context` = ?"
   + " AND `subject` = ?"
   + " AND `role` IN (?)"
   + " AND `object` != ''", [cmd.ctx.name, cmd.subject, cmd.ctx.verbs[cmd.verb]], function (err, rows) {
   if (err) return cb(err);
   cb(null, rows.map(function (row) {
   return row.object;
   }));
   });/*/
  var query = {
    context: cmd.ctx.name,
    subject: cmd.subject
  };
  Relation.find(query)
    .select('object')
    .where('role').in(cmd.ctx.verbs[cmd.verb])
    .where('object').ne('')
    .exec(function (err, rows) {
      if (err) return cb(err);
      cb(null, rows.map(function (row) {
        return row.object;
      }));
    });
});

store.on('role-request', function (cmd, cb) {
  /*  client.query("SELECT `object` FROM `relations`"
   + " WHERE `context` = ?"
   + " AND `subject` = ?"
   + " AND `role` = ?"
   + " AND `object` != ''", [cmd.ctx.name, cmd.subject, cmd.role], function (err, rows) {
   if (err) return cb(err);
   cb(null, rows.map(function (row) {
   return row.object;
   }));
   });     */
  var query = {
    context: cmd.ctx.name,
    subject: cmd.subject,
    role: cmd.role
  };
  Relation.find(query)
    .select('object')
    .where('object').ne('')
    .exec(function (err, rows) {
      if (err) return cb(err);
      cb(null, rows.map(function (row) {
        return row.object;
      }));
    });
});

store.on('verb-subject-request', function (cmd, cb) {
  /*  client.query("SELECT `subject` FROM `relations`"
   + " WHERE `context` = ?"
   + " AND `object` = ?"
   + " AND `role` IN (?)", [cmd.ctx.name, cmd.object, cmd.ctx.verbs[cmd.verb]], function (err, rows) {
   if (err) return cb(err);
   cb(null, rows.map(function (row) {
   return row.subject;
   }));
   });      */
  var query = {
    context: cmd.ctx.name,
    object: cmd.object
  };
  Relation.find(query)
    .select('subject')
    .where('role').in(cmd.ctx.verbs[cmd.verb])
    .exec(function (err, rows) {
      if (err) return cb(err);
      cb(null, rows.map(function (row) {
        return row.subject;
      }));
    });
});

store.on('role-subject-request', function (cmd, cb) {
  /*
   client.query("SELECT `subject` FROM `relations`"
   + " WHERE `context` = ?"
   + " AND `object` = ?"
   + " AND `role` = ?", [cmd.ctx.name, cmd.object, cmd.role], function (err, rows) {
   if (err) return cb(err);
   cb(null, rows.map(function (row) {
   return row.subject;
   }));
   });
   */
  var query = {
    context: cmd.ctx.name,
    object: cmd.object,
    role: cmd.role
  };
  Relation.find(query)
    .select('subject')
    .exec(function (err, rows) {
      if (err) return cb(err);
      cb(null, rows.map(function (row) {
        return row.subject;
      }));
    });

});

store.on('object-verb-request', function (cmd, cb) {
  /*
   client.query("SELECT `role` FROM `relations`"
   + " WHERE `context` = ?"
   + " AND `object` = ?"
   + " AND `subject` = ?", [cmd.ctx.name, cmd.object, cmd.subject], function (err, rows) {
   if (err) return cb(err);
   cb(null, rows.reduce(function (verbs, row) {
   return verbs.concat(cmd.ctx.roles[row.role] || []);
   }, []));
   });
   */
  var query = {
    context: cmd.ctx.name,
    object: cmd.object,
    subject: cmd.subject
  };
  Relation.find(query)
    .select('role')
    .exec(function (err, rows) {
      if (err) return cb(err);
      cb(null, rows.reduce(function (verbs, row) {
        return verbs.concat(cmd.ctx.roles[row.role] || []);
      }, []));
    });

});

store.on('object-role-map-request', function (cmd, cb) {
  /*
   client.query("SELECT `object`, `role` FROM `relations`"
   + " WHERE `context` = ?"
   + " AND `subject` = ?", [cmd.ctx.name, cmd.subject], function (err, rows) {
   if (err) return cb(err);
   cb(null, rows.reduce(function (map, row) {
   map[row.object] || (map[row.object] = [])
   map[row.object].push(row.role);
   return map;
   }, {}));
   });
   */
  var query = {
    context: cmd.ctx.name,
    subject: cmd.subject
  };
  Relation.find(query)
    .select('role object')
    .exec(function (err, rows) {
      if (err) return cb(err);
      cb(null, rows.reduce(function (map, row) {
        map[row.object] || (map[row.object] = []);
        map[row.object].push(row.role);
        return map;
      }, {}));
    });
});

store.on('subject-role-map-request', function (cmd, cb) {
/*
  client.query("SELECT `subject`, `role` FROM `relations`"
  + " WHERE `context` = ?"
  + " AND `object` = ?", [cmd.ctx.name, cmd.object || ''], function (err, rows) {
    if (err) return cb(err);
    cb(null, rows.reduce(function (map, row) {
      map[row.subject] || (map[row.subject] = [])
      map[row.subject].push(row.role);
      return map;
    }, {}));
  });
*/
  var query = {
    context: cmd.ctx.name,
    object: cmd.object || ''
  };
  Relation.find(query)
    .select('subject role')
    .exec(function (err, rows) {
      if (err) return cb(err);
      cb(null, rows.reduce(function (map, row) {
        map[row.subject] || (map[row.subject] = [])
        map[row.subject].push(row.role);
        return map;
      }, {}));
    });});

store.on('reset', function (cb) {
  Relation.remove({}, cb);
});
