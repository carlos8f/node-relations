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