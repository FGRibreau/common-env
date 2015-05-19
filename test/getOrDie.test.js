'use strict';

var t = require('chai').assert;
var _ = require('lodash');

describe('.getOrDie', function () {
  var env;

  beforeEach(function () {
    env = require('..')();
  });

  it('should crash the app if the env. variable did not exist', function (done) {
    try {
      env.getOrDie('AAAAAAAAAAAA');
    } catch (err) {
      t.ok(err instanceof env.CommonEnvGetOrDieException);
      done();
    }
  });
});
