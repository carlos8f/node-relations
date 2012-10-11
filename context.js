var parser = require('./parser')
  , relations = require('./')

function copy (obj) {
  if (Array.isArray(obj)) {
    return obj.slice();
  }
  else if (typeof obj === 'object') {
    var c = {};
    Object.keys(obj).forEach(function (k) {
      c[k] = copy(obj[k]);
    });
    return c;
  }
  return obj;
}

function Context (name, structure) {
  this.name = name;
  this.roles = copy(structure);
  var ctx = this;
  this.verbs = Object.keys(ctx.roles).reduce(function (verbs, role) {
    ctx.roles[role].forEach(function (verb) {
      if (typeof verbs[verb] === 'undefined') {
        verbs[verb] = [];
      }
      verbs[verb].push(role);
    });
    return verbs;
  }, {});
}
module.exports = Context;

Context.prototype.parse = function () {
  var args = [].slice.call(arguments);
  var str = args.shift();
  var str, named, unnamed, fn;
  do {
    var arg = args.shift();
    if (typeof arg === 'object') {
      named = arg;
    }
    else if (Array.isArray(arg)) {
      unnamed = arg;
    }
    else if (typeof arg === 'string' || typeof arg === 'number') {
      if (typeof arg === 'string' && !str) {
        str = arg;
        continue;
      }
      unnamed || (unnamed = []);
      unnamed.push(arg);
    }
    else if (typeof arg === 'function') {
      fn = arg;
    }
  } while (args.length);

  function raiseErr (err) {
    if (!err instanceof Error) err = new Error(err);
    if (fn) return fn(err);
    throw err;
  }

  if (!str) {
    return raiseErr('must pass a string to parse');
  }
  try {
    var cmd = parser.parse(str);
  }
  catch (e) {
    return raiseErr(e.message);
  }

  cmd.ctx = this;
  cmd.fn = function (err, value) {
    if (err) return raiseErr(err);
    if (fn) fn(null, value);
  };

  relations.emit('cmd', cmd);
};