relations
=========

entity relationship, role, and permissions API for Node.js

[![build status](https://secure.travis-ci.org/carlos8f/node-relations.png)](http://travis-ci.org/carlos8f/node-relations)

**relations** is a simple permissions API which uses a natural language approach.

Contexts
--------

First, you'll create a **context**, which contains a list of roles which map to
actions. Here we'll create a context called `repos`, to model Github repositories.

```js
var relations = require('relations');

relations.define('repos', {
  owner: ['pull', 'push', 'administrate'],
  collaborator: ['pull', 'push'],
  watcher: ['pull']
});
```

Defining the context makes available a method on `relations` that matches the
context name, in this case, `relations.repos()`. This is the only method we'll
need to call.

Declarations
------------

Now, we need to tell our app who has those roles for which repos.

```js
relations.repos('Carlos is the owner of buffet.');
```

This assigns the role `owner` to the subject `Carlos` for the object `buffet`.

### Token replacements

Note that the API has multiple syntaxes, and this is functionally equivalent:

```js
relations.repos(':user is owner of :repo', {user: 'Carlos', repo: 'buffet'});
```

As is this:

```js
relations.repos('%s is an owner of %s', 'Carlos', 'buffet');
```

To assign a role which should apply to all objects, simply leave the object out
of the sentence:

```js
relations.repos('%s is a watcher.', 'Brian');
```

**Note: Using token replacements is recommended, to prevent injection attacks!**

### Syntax

The syntax for a **declaration** consists of:

```
<subject> is [ a / an / the ] <role> [ [ of / to / from / in ] <object> ] [.]
```

Verb question
-------------

To ask if a user can perform an action:

```js
relations.repos('Can %s pull?', 'Brian', function (err, can) {
  // can = true (based on "watcher" role)
});
```

We can also check if an action can be performed on a specific object:

```js
relations.repos('Can %s push to buffet?', 'Brian', function (err, can) {
  // can = false (Brian doesn't have "owner" or "collaborator" roles)
});
```

### Syntax

The syntax for an **verb question** consists of:

```
( Can | can ) <subject> <verb> [ [ of / to / from / in ] <object> ] [?]
```

Role question
-------------

To check if a user has a role:

```js
relations.repos('Is %s a collaborator of %s?', 'Brian', 'buffet', function (err, is) {
  // is = false
});
```

We can also leave the object out to check for a global role:

```js
relations.repos('Is %s a %s?', 'Brian', 'watcher', function (err, is) {
  // is = true
});
```

### Syntax

The syntax for a **role question** consists of:

```
( Is | is ) <subject> [ a / an / the ] <role> [ [ of / to / from / in ] <object> ] [?]
```

Verb request
------------

In addition to true/false checks, **relations** can return an array of objects
which match certain criteria. For example:

```js
relations.repos('What can %s pull from?', 'Carlos', function (err, repos) {
  // repos = ['buffet']
});
```

### Syntax

The syntax for a **verb request** consists of:

```
( What | what ) can <subject> <verb> [ of / to / from / in ] [?]
```

Role request
------------

Also, we can ask for an array of objects a user has a role for:

```js
relations.repos('What is %s the owner of?', 'Carlos', function (err, repos) {
  // repos = ['buffet']
});
```

### Syntax

The syntax for a **role request** consists of:

```
( What | what ) is <subject> [ a / an / the ] <role> [ of / to / from / in ] [?]
```

Verb subject request
--------------------

To request an array of subjects who can perform an action on an object:

```js
relations.repos('Who can pull from %s?', 'buffet', function (err, users) {
  // users = ['Carlos']
});
```

### Syntax

```
( Who | who ) can <verb> [ of / to / from / in ] <object> [?]
```

Role subject request
--------------------

To request an array of subjects who have a role for an object:

```js
relations.repos('Who is the owner of %s?', 'buffet', function (err, users) {
  // users = ['Carlos']
});
```

### Syntax

```
( Who | who ) can <verb> [ of / to / from / in ] <object> [?]
```

Revocation
----------

To revoke a role:

```js
relations.repos('%s is not the owner of %s', 'Carlos', 'buffet');
```

### Syntax

```
<subject> ( is not | isn't ) [ a / an / the ] <role> [ [ of / to / from / in ] <object> ] [.]
```

Pluggable data store
--------------------

**relations** uses a memory store out-of-the-box, which only works with a single
node processes and has no persistence. Two data stores are also provided 
however: Redis and MySQL.

### Redis store

To use the redis store, your app must make a
[node_redis](https://github.com/mranney/node_redis) client and pass it like so:

```js
var relations = require('relations')
  , redis = require('redis')

relations.use(relations.stores.redis, {client: redis.createClient()});
```

### MySQL store

To use the MySQL store, your app must make a
[node-mysql](https://github.com/felixge/node-mysql) client and pass it like so:

```js
var relations = require('relations')
  , mysql = require('mysql')

relations.use(relations.stores.mysql, {client: mysql.createConnection({user: 'root', database: 'test'})});
```

### Make your own store

A **relations** store is simply a node module that exports an event emitter
and responds to the following events:

#### `init` (options, cb)

Initialize the store with `options` (from `relations.use()`) and call `cb(err)`
when done.

#### `declaration` (cmd, cb)

Respond to a declaration and call `cb()` when done. `cmd` will be an object
containing the properties:

- ctx - context object
- subject
- role
- object (optional)

#### `revocation` (cmd, cb)

Respond to a revocation and call `cb()` when done. `cmd` will be an object
containing the properties:

- ctx - context object
- subject
- role
- object (optional)

### `verb-question` (cmd, cb)

Respond to a verb question and call `cb(err, /* boolean */ can)` with the result.
`cmd` will be an object containing the properties:

- ctx - context object
- subject
- verb
- object (optional)

### `role-question` (cmd, cb)

Respond to a role question and call `cb(err, /* boolean */ is)` with the result.
`cmd` will be an object containing the properties:

- ctx - context object
- subject
- role
- object (optional)

### `verb-request` (cmd, cb)

Respond to a verb request and call `cb(err, /* array */ objects)` with the result.
`cmd` will be an object containing the properties:

- ctx - context object
- subject
- verb

### `role-request` (cmd, cb)

Respond to a role request and call `cb(err, /* array */ objects)` with the result.
`cmd` will be an object containing the properties:

- ctx - context object
- subject
- role

### `verb-subject-request` (cmd, cb)

Respond to a verb subject request and call `cb(err, /* array */ subjects)` with
the result. `cmd` will be an object containing the properties:

- ctx - context object
- verb
- object

### `role-subject-request` (cmd, cb)

Respond to a role subject request and call `cb(err, /* array */ subjects)` with
the result. `cmd` will be an object containing the properties:

- ctx - context object
- role
- object

### `reset` (cb)

Reset the store, dumping all storage and structure, calling `cb(err)` when done.

- - -

### Developed by [Terra Eclipse](http://www.terraeclipse.com)
Terra Eclipse, Inc. is a nationally recognized political technology and
strategy firm located in Aptos, CA and Washington, D.C.

- - -

### License: MIT

- Copyright (C) 2012 Carlos Rodriguez (http://s8f.org/)
- Copyright (C) 2012 Terra Eclipse, Inc. (http://www.terraeclipse.com/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.