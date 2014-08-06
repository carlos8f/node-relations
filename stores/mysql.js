var store = module.exports = require('eventflow')();
var client;

store.on('init', function (options, cb) {
  if (!options.client) {
    return cb(new Error('must pass a node-mysql client in options.client to use mysql store'));
  }
  client = store._client = options.client;
  if (options.database) {
    client.query("CREATE DATABASE IF NOT EXISTS " + options.database, function (err) {
      if (err) return cb(err);
      client.query("USE " + options.database, initTable);
    });
  }
  else {
    initTable();
  }
  function initTable (err) {
    if (err) return cb(err);
    client.query("CREATE TABLE IF NOT EXISTS `relations` ("
      + "`context` VARCHAR(255) NOT NULL,"
      + "`subject` VARCHAR(255) NOT NULL,"
      + "`role` VARCHAR(255) NOT NULL,"
      + "`object` VARCHAR(255) NOT NULL,"
      + "PRIMARY KEY (`context`, `subject`, `role`, `object`),"
      + "INDEX object (`context`, `role`, `object`)"
      + ") ENGINE=InnoDB", cb);
  }
});

store.on('declaration', function (cmd, cb) {
  var record = {
    context: cmd.ctx.name,
    subject: cmd.subject,
    role: cmd.role,
    object: cmd.object || ""
  };
  client.query("INSERT INTO `relations` SET ?", record, function (err) {
    if (err && err.code === 'ER_DUP_ENTRY') cb();
    else cb(err);
  });
});

store.on('revocation', function (cmd, cb) {
  client.query("DELETE FROM `relations`"
    + " WHERE `context` = ?"
    + " AND `subject` = ?"
    + " AND `role` = ?"
    + " AND `object` = ?", [cmd.ctx.name, cmd.subject, cmd.role, cmd.object], cb);
});

store.on('verb-question', function (cmd, cb) {
  client.query("SELECT 1 FROM `relations`"
    + " WHERE `context` = ?"
    + " AND `subject` = ?"
    + " AND `role` IN (?)"
    + " AND (`object` = ? || `object` = '')", [cmd.ctx.name, cmd.subject, cmd.ctx.verbs[cmd.verb], cmd.object || ""], function (err, rows) {
      if (err) return cb(err);
      cb(null, !!rows[0]);
    });
});

store.on('role-question', function (cmd, cb) {
  client.query("SELECT 1 FROM `relations`"
    + " WHERE `context` = ?"
    + " AND `subject` = ?"
    + " AND `role` = ?"
    + " AND (`object` = ? || `object` = '')", [cmd.ctx.name, cmd.subject, cmd.role, cmd.object || ""], function (err, rows) {
      if (err) return cb(err);
      cb(null, !!rows[0]);
    });
});

store.on('verb-request', function (cmd, cb) {
  client.query("SELECT `object` FROM `relations`"
    + " WHERE `context` = ?"
    + " AND `subject` = ?"
    + " AND `role` IN (?)"
    + " AND `object` != ''", [cmd.ctx.name, cmd.subject, cmd.ctx.verbs[cmd.verb]], function (err, rows) {
      if (err) return cb(err);
      cb(null, rows.map(function (row) { return row.object; }));
    });
});

store.on('role-request', function (cmd, cb) {
  client.query("SELECT `object` FROM `relations`"
    + " WHERE `context` = ?"
    + " AND `subject` = ?"
    + " AND `role` = ?"
    + " AND `object` != ''", [cmd.ctx.name, cmd.subject, cmd.role], function (err, rows) {
      if (err) return cb(err);
      cb(null, rows.map(function (row) { return row.object; }));
    });
});

store.on('verb-subject-request', function (cmd, cb) {
  client.query("SELECT `subject` FROM `relations`"
    + " WHERE `context` = ?"
    + " AND `object` = ?"
    + " AND `role` IN (?)", [cmd.ctx.name, cmd.object, cmd.ctx.verbs[cmd.verb]], function (err, rows) {
      if (err) return cb(err);
      cb(null, rows.map(function (row) { return row.subject; }));
    });
});

store.on('role-subject-request', function (cmd, cb) {
    client.query("SELECT `subject` FROM `relations`"
    + " WHERE `context` = ?"
    + " AND `object` = ?"
    + " AND `role` = ?", [cmd.ctx.name, cmd.object, cmd.role], function (err, rows) {
      if (err) return cb(err);
      cb(null, rows.map(function (row) { return row.subject; }));
    });
});

store.on('object-verb-request', function (cmd, cb) {
  client.query("SELECT `role` FROM `relations`"
  + " WHERE `context` = ?"
  + " AND `object` = ?"
  + " AND `subject` = ?", [cmd.ctx.name, cmd.object, cmd.subject], function (err, rows) {
    if (err) return cb(err);
    cb(null, rows.reduce(function (verbs, row) {
      return verbs.concat( cmd.ctx.roles[row.role] || [] );
    }, []));
  });
});

store.on('object-role-map-request', function (cmd, cb) {
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
});

store.on('subject-role-map-request', function (cmd, cb) {
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
});

store.on('reset', function (cb) {
  client.query("DROP TABLE IF EXISTS `relations`", cb);
});