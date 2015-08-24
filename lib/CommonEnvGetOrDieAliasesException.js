'use strict';
var util = require('util');
var _ = require('lodash');

function CommonEnvGetOrDieAliasesException(aliases) {
  aliases = _.isArray(aliases) ? aliases : [];
  this.message = 'At least one environment variable of [{key}] MUST be defined'.replace('{key}', aliases.join(', '));
  this.name = 'CommonEnvGetOrDieAliasesException';
}

util.inherits(CommonEnvGetOrDieAliasesException, Error);

module.exports = CommonEnvGetOrDieAliasesException;
