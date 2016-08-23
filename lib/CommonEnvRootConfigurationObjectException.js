'use strict';
var util = require('util');

function CommonEnvRootConfigurationObjectException(object, prefix) {
  this.message = '{prefix} array contains a special common-env configuration object (e.g. {$default:"", $types:"" [, $aliases:""]}) where it should contains an simple object'.replace('{prefix}', prefix);
  this.name = 'CommonEnvRootConfigurationObjectException';
}

util.inherits(CommonEnvRootConfigurationObjectException, Error);

module.exports = CommonEnvRootConfigurationObjectException;
