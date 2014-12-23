common-env [![Build Status](https://drone.io/github.com/FGRibreau/common-env/status.png)](https://drone.io/github.com/FGRibreau/common-env/latest)
[![Deps](https://david-dm.org/FGRibreau/common-env.png)](https://david-dm.org/FGRibreau/common-env)
[![Version](http://badge.fury.io/js/common-env.png)](https://david-dm.org/FGRibreau/common-env)

==========

A little helper I use everywhere for configuration. Environment variables are a really great way to quickly change a program behavior.

<p align="center">
<img style="width:100%" src="./docs/configuration.gif"/>
</p>

# npm

```shell
npm install common-env
```

# Usage

```javascript
var env = require('common-env');

// AMQP_CONNECT=true node test.js
var config = env.getOrElseAll({
  amqp: {
    login: 'guest',
    password: 'guest',
    host: 'localhost',
    port: 5672,
    connect: false
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
t.strictEqual(config.FULL_UPPER_CASE.PORT, 8080);
```
