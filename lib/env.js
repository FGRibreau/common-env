/*global process, module */
'use strict';

var _ = require('lodash');
var types = require('./types');
var EventEmitter = require('events').EventEmitter;
var CommonEnvGetOrDieException = require('./CommonEnvGetOrDieException');
var CommonEnvGetOrDieAliasesException = require('./CommonEnvGetOrDieAliasesException');

var EVENT_FOUND = 'env:found';
var EVENT_FALLBACK = 'env:fallback';

module.exports = function envFactory() {
  var em = new EventEmitter();


  var getOrDie = getOrDieFactory(function (fullKeyName) {
    throw new CommonEnvGetOrDieException(fullKeyName);
  });

  var getOrDieWithAliases = getOrDieFactory(function (fullKeyName, aliases) {
    throw new CommonEnvGetOrDieAliasesException(aliases);
  });

  function getOrElseAll(object, prefix) {
    prefix = prefix || '';

    return _.reduce(object, function (config, value, key) {
      var keyName = key.toUpperCase();
      var fullKeyName = prefix + keyName;

      if (isAliasesObject(value)) {
        config[key] = getOrElseAliases(fullKeyName, value);
      } else if (_.isPlainObject(value)) {
        config[key] = getOrElseAll(value, fullKeyName + '_');
      } else if (_.isArray(value) && !isArrayOfAtom(value)) {
        config[key] = getOrElseArray(fullKeyName, value);
      } else {
        config[key] = getOrElse(fullKeyName, value);
      }

      return config;
    }, {});
  }

  // helpers
  function getOrElseArray(fullKeyName, value) {
    return value.map(function (innerVal, index) {
      return getOrElseAll(innerVal, fullKeyName + '[' + index + ']_');
    });
  }

  function getOrElseAliases(fullKeyName, object) {
    if (!Array.isArray(object.$aliases)) {
      throw new Error('Common-env: $aliases must be defined along side $default, key: ' + fullKeyName);
    }

    var $typeConverter = object.$type || getTypeConverter(object.$default);

    return object.$aliases.concat([fullKeyName]).reduce(function (memo, varEnvName, i, aliases) {
      var isLast = i === aliases.length - 1;

      if (memo !== null) {
        return memo;
      }

      // only try to get an env var if memo is undefined
      if (isLast) {
        return _.isUndefined(object.$default) ? getOrDieWithAliases(varEnvName, aliases) : getOrElse(varEnvName, object.$default, $typeConverter);
      }

      return getOrElse(varEnvName, null, $typeConverter);
    }, null);
  }

  /**
   * [getOrElse description]
   * @param  {String} fullKeyName    env. var. name
   * @param  {B} $default       default fallback value
   * @param  {Function} $typeConverter f(A) -> B
   * @return {B}
   */
  function getOrElse(fullKeyName, $default, $typeConverter) {
    $typeConverter = $typeConverter || getTypeConverter($default);

    if (_.has(process.env, fullKeyName)) {
      return emitFound(fullKeyName, $typeConverter(process.env[fullKeyName]));
    }

    return emitFallback(fullKeyName, $default);
  }

  function getOrDieFactory(f) {
    return function (fullKeyName /* args */ ) {
      var value = getOrElse(fullKeyName, null);

      if (value === null) {
        f.apply(null, arguments);
      }

      return value;
    };
  }

  function emitFound(key, value) {
    em.emit(EVENT_FOUND, key, value);
    return value;
  }

  function emitFallback(key, value) {
    em.emit(EVENT_FALLBACK, key, value);
    return value;
  }

  return _.extend(em, {
    getOrElseAll: getOrElseAll,
    getOrElse: getOrElse,
    getOrDie: getOrDie,

    EVENT_FOUND: EVENT_FOUND,
    EVENT_FALLBACK: EVENT_FALLBACK,

    types: types.convert,

    CommonEnvGetOrDieException: CommonEnvGetOrDieException,
    CommonEnvGetOrDieAliasesException: CommonEnvGetOrDieAliasesException
  });
};

// Helpers

function getTypeConverter($default) {
  return isArrayOfAtom($default) ? arrayTypeConverter($default) : function (value) {

    if (_.isNumber($default)) {
      return toInt(value);
    }

    if (types.seems.Boolean(value)) {
      return String(value).toLowerCase() === 'true';
    }

    return value;
  };
}

function toInt(str) {
  return parseInt(str, 10);
}

function isArrayOfAtom(array) {
  return _.isArray(array) && array.every(isAtom);
}

function isAliasesObject(value) {
  return _.isPlainObject(value) && (_.has(value, '$default') || _.has(value, '$aliases'));
}

/**
 * [arrayTypeConverter description]
 * @param  {string} value environment value
 * @return {[type]}       [description]
 */
function arrayTypeConverter($default) {
  var typeConverter = getTypeConverter($default[0]);
  return function (value) {
    return value.split(',').map(typeConverter);
  };
}

/**
 * @param  {mixed}  value
 * @return {Boolean}       true if the specified value is either a string, a number or a boolean
 */
function isAtom(value) {
  return _.isString(value) || _.isNumber(value) || types.seems.Boolean(value);
}
