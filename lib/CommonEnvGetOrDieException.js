'use strict';
var util = require('util');

function CommonEnvGetOrDieException(key) {
  this.message = '{key} MUST be defined'.replace('{key}', key);
  this.name = 'CommonEnvGetOrDieException';
}

util.inherits(CommonEnvGetOrDieException, Error);

module.exports = CommonEnvGetOrDieException;
