'use strict';

var t = require('chai').assert;
var _ = require('lodash');

describe('withLogger', function() {
  var env, logger;

  beforeEach(function() {
    logger = {
      calls: [],
      info: function() {
        this.calls.push(_.toArray(arguments));
      }
    };
    _.bindAll(logger);
    env = require('../withLogger')(logger);
  });

  it('should display logs', function() {
    env.getOrElse('HELLO_WORLD', 'fallback');
    t.deepEqual(logger.calls, [["[env] %s was not defined, using default: %s", "HELLO_WORLD", "fallback"]]);
  });

  it('should handle $secure to silent log value', function() {
    process.env = {};
    process.env.USERNAME = 'HeyIamPublic';
    process.env.PASSWORD = 'ohMyGodImSoSecret';

    var config = env.getOrElseAll({
      username: 'HeyIamPublic',
      password: {
        $default: 'iAmUseless',
        $secure: true
      }
    });
    t.strictEqual(config.username, process.env.USERNAME);
    t.strictEqual(config.password, process.env.PASSWORD);
    t.deepEqual(logger.calls, [
      ["[env] %s was defined, using: %s", "USERNAME", process.env.USERNAME],
      ["[env] %s was defined, using: %s", "PASSWORD", "***"]
    ]);
  });

  it('should invalid $secure value', function() {
    t.throw(() => {
      env.getOrElseAll({
        username: 'HeyIamPublic',
        password: {
          $default: 'iAmUseless',
          $secure: 'plop'
        }
      });
    });

  });
});
