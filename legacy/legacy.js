'use strict';

var envFactory = require('..');

module.exports = function () {
  var env = envFactory();

  env.on(env.EVENT_FOUND, function (fullKeyName, value) {
      console.log('[env] %s was defined, using: %s', fullKeyName, String(value));
    })
    .on(env.EVENT_FALLBACK, function (fullKeyName, $default) {
      console.log('[env] %s was not defined, using default: %s', fullKeyName, String($default));
    });

  return env;
};
