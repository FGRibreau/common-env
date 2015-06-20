common-env
==========

[![Build Status](https://drone.io/github.com/FGRibreau/common-env/status.png)](https://drone.io/github.com/FGRibreau/common-env/latest)
[![Deps](https://david-dm.org/FGRibreau/common-env.png)](https://david-dm.org/FGRibreau/common-env)
[![Version](http://badge.fury.io/js/common-env.png)](https://david-dm.org/FGRibreau/common-env)

A little helper I use everywhere for configuration. [Environment variables](http://blog.honeybadger.io/ruby-guide-environment-variables/) are a really great way to quickly change a program behavior.

# philosophy

Here is my principle:

> Every constant in code: number, boolean or string* should be configurable

\* besides i18n translation key an things like that of course (well, now that we've got symbols in ES6...)

# npm

```shell
npm install common-env
```

# env.getOrDie(envVarName)

# env.getOrElse(envVarName, default)

# env.getOrElseAll(object)

```javascript
var logger = console;
var env = require('common-env')();

// AMQP_LOGIN=plop AMQP_CONNECT=true AMQP_EXCHANGES[0]_NAME=new_exchange node test.js
var config = env.getOrElseAll({
  amqp: {
    login: 'guest',
    password: 'guest',
    host: 'localhost',
    port: 5672,
    connect: false,
    exchanges:[{
      name: 'first_exchange'
    },{
      name: 'second_exchange'
    }]
  },

  FULL_UPPER_CASE: {
    PORT: 8080
  },

  MICROSTATS: {
    HASHKEY: 'B:mx:global'
  }
});

t.strictEqual(config.amqp.login, 'plop'); // converted from env
t.strictEqual(config.amqp.port, 5672);
t.strictEqual(config.amqp.connect, true); // converted from env
t.strictEqual(config.amqp.exchanges[0].name, 'new_exchange'); // extracted from env
t.strictEqual(config.FULL_UPPER_CASE.PORT, 8080);
```

# env.on('env:fallback', f(key, $default))
# env.on('env:found', f(key, value, $default))

```javascript
// let set NODE_ENV was set to "production"

var config = env
      .on('env:found', function (fullKeyName, value) {
        console.log('[env] %s was defined, using: %s', fullKeyName, String(value));
      })
      .on('env:fallback', function (fullKeyName, $default) {
        console.log('[env] %s was not defined, using default: %s', fullKeyName, String($default));
      })
      .getOrElseAll({
        node: {
          env: 'production'
        },
        a: {
          b: 'ok'
        }
      });

// Will print

// [env] NODE_ENV was defined, using: production
// [env] A_B was not defined, using default: ok
```


## Specifying multiple aliases

It's sometimes useful to be able to specify aliases, for instance [Clever-cloud](http://clever-cloud.com) or [Heroku](https://heroku.com) expose their own environment variable names while your application's internal code may not want to rely on them. You may not want to depend on your hosting provider conventions.

Common-env adds a [layer of indirection](http://en.wikipedia.org/wiki/Fundamental_theorem_of_software_engineering) enabling you to specify environment aliases that won't impact your codebase.

#### Usage

```javascript
var config = env.getOrElseAll({
  amqp: {
    login: {
      $default: 'guest',
      $aliases: ['ADDON_RABBITMQ_LOGIN', 'LOCAL_RABBITMQ_LOGIN']
    },
    password: 'guest',
    host: 'localhost',
    port: 5672
  }
});

t.strictEqual(config.amqp.login, 'plop'); // converted from env
```

#### How common-env resolves `config.amqp.login`

- Common-env will first read `ADDON_RABBITMQ_LOGIN` environment variable, if it exists, its value will be used.
- If not common-env will read `LOCAL_RABBITMQ_LOGIN`, if it exists, its value will be used.
- If not common-env will read `AMQP_LOGIN`, if it exists, its value will be used.
- If not common-env will fallback on `$default` value.

<p align="center">
<img style="width:100%" src="./docs/Thumbs-Up-Gif.gif"/>
</p>


# How to retrieve old common-env logging behaviour

Common-env 1.x.x-2.x.x was displaying logs, here is how to retrieve the same behaviour in 3.x.x.

```javascript
var logger = console;
var config = require('common-env/withLogger')(logger).getOrElseAll({
  amqp: {
    login: {
      $default: 'guest',
      $aliases: ['ADDON_RABBITMQ_LOGIN', 'LOCAL_RABBITMQ_LOGIN']
    },
    password: 'guest',
    host: 'localhost',
    port: 5672
  }
});

```

# [Changelog](/CHANGELOG.md)
