'use strict';

var t = require('chai').assert;
var _ = require('lodash');

describe('withLogger', function () {
  var env, logger;

  beforeEach(function () {
    logger = {
      calls: [],
      info: function () {
        this.calls.push(_.toArray(arguments));
      }
    };
    _.bindAll(logger);
    env = require('../withLogger')(logger);
  });

  it('should display logs', function () {
    env.getOrElse('HELLO_WORLD', 'fallback');
    t.deepEqual(logger.calls, [["[env] %s was not defined, using default: %s", "HELLO_WORLD", "fallback"]]);
  });
});
