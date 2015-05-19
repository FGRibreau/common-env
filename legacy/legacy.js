'use strict';

var envFactory = require('..');

module.exports = function (logger) {
  logger = logger || console;
  var env = envFactory();

  env.on(env.EVENT_FOUND, function (fullKeyName, value) {
      logger.info('[env] %s was defined, using: %s', fullKeyName, String(value));
    })
    .on(env.EVENT_FALLBACK, function (fullKeyName, $default) {
      logger.info('[env] %s was not defined, using default: %s', fullKeyName, String($default));
    });

  return env;
};
