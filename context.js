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
  this.roles = copy(structure) || {};
  this.update();
}
module.exports = Context;

Context.prototype.update = function () {
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
};

Context.prototype.updateRole = function (name, verbs) {
  this.roles[name] = copy(verbs);
  this.update();
};

Context.prototype.addRole = function (name, verbs) {
  if (typeof this.roles[name] !== 'undefined') {
    var err = new Error('role already defined: ' + name);
    err.code = 'ER_DUP_ROLE';
    throw err;
  }
  this.updateRole(name, verbs);
};

Context.prototype.removeRole = function (name) {
  delete this.roles[name];
  this.update();
};

Context.prototype.getRoles = function (verb) {
  var ctx = this;
  return Object.keys(ctx.roles).filter(function (role) {
    return (ctx.roles[role].indexOf(verb) >= 0);
  });
};