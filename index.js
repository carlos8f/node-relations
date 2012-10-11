var relations = module.exports = require('eventflow')();

var Context = require('./context');

relations.define = function (name, structure) {
  var ctx = new Context(name, structure);
  relations[name] = ctx.parse.bind(ctx);
};

relations._queue = [];

relations.stores = {
  memory: require('./stores/memory')
};

relations.use = function (store) {
  relations.store = store;
  store.once('ready', function () {
    relations._ready = true;
  });
};

relations.on('cmd', function (cmd) {
  if (cmd.verb && !cmd.ctx.verbs[cmd.verb]) {
    return cmd.fn('verb not defined: "' + cmd.verb + '"');
  }
  if (cmd.role && !cmd.ctx.roles[cmd.role]) {
    return cmd.fn('role not defined: "' + cmd.role + '"');
  }
  relations._queue.push(cmd);
});

(function doQueue () {
  process.nextTick(function () {
    if (!relations.store) {
      relations.use(relations.store.memory);
    }
    if (relations._ready && relations._queue.length) {
      var cmd = relations._queue.shift();
      relations.store.invoke(cmd.type, cmd, cmd.fn);
    }
    doQueue();
  });
})();