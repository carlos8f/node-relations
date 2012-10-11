var relations = module.exports = require('eventflow')()
  , parser = require('./parser')
  , Context = require('./context')

relations.define = function (name, structure) {
  var ctx = new Context(name, structure);

  relations[name] = function () {
    var args = [].slice.call(arguments);
    var str = args.shift();
    var str, named, unnamed, fn;
    do {
      var arg = args.shift();
      if (Array.isArray(arg)) {
        unnamed = arg;
      }
      else if (typeof arg === 'object') {
        named = arg;
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

    cmd.fn = function (err, value) {
      if (err) return raiseErr(err);
      if (fn) fn(null, value);
    };

    if (named && unnamed) {
      return cmd.fn('cannot mix named and unnamed tokens');
    }

    ['subject', 'role', 'verb', 'object'].forEach(function (k) {
      if (cmd[k]) {
        if (cmd[k].name) {
          if (typeof named[cmd[k].name] === 'undefined') {
            return cmd.fn('no data for named token :' + cmd[k].name);
          }
          cmd[k] = named[cmd[k].name];
        }
        else if (cmd[k].type) {
          if (typeof unnamed[cmd[k].index] === 'undefined') {
            return cmd.fn('no data for unnamed token (index: ' + cmd[k].index + ')');
          }
          cmd[k] = unnamed[cmd[k].index];
          if (cmd[k].type === 'number') {
            cmd[k] = parseFloat(cmd[k]);
          }
        }
        else if (cmd[k].value) {
          cmd[k] = cmd[k].value;
        }
        else {
          return cmd.fn('weird error parsing "' + str + '"');
        }
        if (k === 'role' && !ctx.roles[cmd.role]) {
          return cmd.fn('role not defined: "' + cmd.role + '"');
        }
        else if (k === 'verb' && !ctx.verbs[cmd.verb]) {
          return cmd.fn('verb not defined: "' + cmd.verb + '"');
        }
      }
    });

    cmd.ctx = ctx;
    relations._queue.push(cmd);
  };
};

relations._queue = [];

relations.stores = {
  memory: require('./stores/memory')
};

relations.use = function (store) {
  relations._ready = false;
  relations.store = store;
  store.invoke('init', {}, function (err) {
    if (err) throw err;
    relations._ready = true;
  });
};

(function doQueue () {
  process.nextTick(function () {
    if (!relations.store) {
      relations.use(relations.stores.memory);
    }
    if (relations._ready && relations._queue.length) {
      var cmd = relations._queue.shift();
      relations.store.invoke(cmd.type, cmd, cmd.fn);
    }
    doQueue();
  });
})();