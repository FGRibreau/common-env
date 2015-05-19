'use strict';

var envFactory = require('..');
var t = require('chai').assert;
var _ = require('lodash');

describe('env', function () {
  var env, logger;

  beforeEach(function () {
    logger = {
      calls: [],
      reset: function () {
        this.calls = [];
      },
      info: function () {
        this.calls.push(_.toArray(arguments).join(' '));
        console.log.apply(console, arguments);
      },
      hasENV: function (env_var) {
        return this.calls.some(function (line) {
          return _.contains(line, env_var);
        });
      }
    };
  });

  afterEach(function () {
    logger.reset();
  });


  describe('configured to not display values', function () {
    beforeEach(function () {
      env = envFactory(logger, {
        displayValues: false
      });
    });

    afterEach(function () {
      env.reset();
    });

    it('should not display values in log', function () {
      process.env.PASSWORD = 'CLEAR_TEXT_PASSWORD';
      env.getOrElseAll({
        password: 'default clear text password'
      });
      t.notInclude(logger.calls[0], process.env.PASSWORD);
    });
  });

  describe('.getOrElseAll', function () {
    beforeEach(function () {
      env = envFactory(logger);
      process.env.AMQP_LOGIN = 'plop';
      process.env.AMQP_CONNECT = 'tRue';
      process.env.AMQP_CONNECT2 = 'false';
      process.env.AMQP_PASSWORD = '';
      process.env['PLOP_API[0]_A'] = 3;
    });

    it('should return an object', function () {
      var config = env.getOrElseAll({
        AMQP: {
          LoGiN: 'guest', // add a bug inside key name (mix lower/upper case)
          PASSWORD: 'guest',
          HOST: 'localhost',
          PORT: 5672,
          connect: false,
          connect2: true,
          PLOP: {
            ok: {
              heyheyhey: true
            }
          }
        },

        c: {
          PORT: 8080,
          root: ''
        },

        MICROSTATS: {
          HASHKEY: 'B:mx:global'
        }
      });

      t.strictEqual(config.AMQP.LoGiN, 'plop');
      t.strictEqual(config.AMQP.PASSWORD, '');
      t.strictEqual(config.AMQP.PORT, 5672);
      t.strictEqual(config.AMQP.PLOP.ok.heyheyhey, true);
      t.strictEqual(config.AMQP.connect, true);
      t.strictEqual(config.AMQP.connect2, false);
      t.strictEqual(config.c.root, '');
    });

    it('should return ask for ENV vars', function () {
      env.getOrElseAll({
        plop: {
          root_token: 'sdfopiqjsdfpoij',
          api: {
            endpoint_protocol: 'https',
            endpoint_host: 'sqdfqsdf.cleverapps.io',
            endpoint_port: ''
          },
          strategy: 'https://strategy.plop.net',
        }
      });

      t.ok(logger.hasENV('PLOP_ROOT_TOKEN'), 'PLOP_ROOT_TOKEN');
      t.ok(logger.hasENV('PLOP_API_ENDPOINT_PORT'), 'PLOP_API_ENDPOINT_PORT');
    });

    it('should handle array as ENV vars', function () {
      var config = env.getOrElseAll({
        plop: {
          api: [{
            a: 1
          }, {
            a: 2
          }]
        }
      });
      t.strictEqual(config.plop.api[0].a, 3);
      t.ok(logger.hasENV('PLOP_API[0]_A'), 'PLOP_ROOT_TOKEN');
      t.ok(logger.hasENV('PLOP_API[1]_A'), 'PLOP_ROOT_TOKEN');
    });

    it('should handle special $aliases and $default object value', function () {
      var config = env.getOrElseAll({
        a: {
          b: [{
            a: {
              $default: 'heyheyhey',
              $aliases: ['BLABLA_BLABLA', 'AMQP_LOGIN']
            }
          }, {
            a: {
              $default: 'plop2',
              $aliases: ['BLABLA_BLABLA'] // `BLABLA_BLABLA` does not exist, it should fallback on "plop"
            }
          }]
        },
        b: {
          $default: 'heyheyhey',
          $aliases: ['BLABLA_BLABLA', 'AMQP_LOGIN', 'BLABLA_BLABLA']
        }
      });

      t.strictEqual(config.a.b[0].a, 'plop', 'should use AMQP_LOGIN value');
      t.ok(logger.hasENV('AMQP_LOGIN was defined'), 'AMQP_LOGIN should be printed');

      t.strictEqual(config.b, 'plop');
      t.ok(logger.hasENV('A_B[1]_A was not defined'), 'A_B[1]_A was not defined should be printed');
    });

    it('should handle special $aliases and $default object value and fallback on default value', function () {
      var config = env.getOrElseAll({
        a: {
          b: [{}, {
            a: {
              $default: 'plop2',
              $aliases: ['BLABLA_BLABLA'] // `BLABLA_BLABLA` does not exist, it should fallback on "plop"
            }
          }]
        }
      });
      t.strictEqual(config.a.b[1].a, 'plop2');
      t.ok(logger.hasENV('A_B[1]_A was not defined'), 'A_B[1]_A was not defined should be printed');
    });

    afterEach(function () {
      env.reset();
      delete process.env.AMQP_LOGIN;
      delete process.env.AMQP_CONNECT;
      delete process.env.AMQP_CONNECT2;
      delete process.env['PLOP_API[0]_A'];
    });
  });


});
