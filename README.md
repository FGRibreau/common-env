common-env
==========

[![Build Status](https://drone.io/github.com/FGRibreau/common-env/status.png)](https://drone.io/github.com/FGRibreau/common-env/latest)
[![Deps](https://david-dm.org/FGRibreau/common-env.png)](https://david-dm.org/FGRibreau/common-env)
[![Version](http://badge.fury.io/js/common-env.png)](https://david-dm.org/FGRibreau/common-env)

A little helper I use everywhere for configuration. Environment variables are a really great way to quickly change a program behavior.

# npm

```shell
npm install common-env
```

# Usage

```javascript
var logger = console;
var env = require('common-env')(logger);

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


<p align="center">
<img style="width:100%" src="./docs/Thumbs-Up-Gif.gif"/>
</p>

# Changelog

## v1.2.0

feat(env): array support in env variables fixes #4

## v1.1.0

feat(options): allow user to ask common-env to not display env vars. values, closes #1 asked by @keruspe
