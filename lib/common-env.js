/*jshint maxcomplexity: 7*/
/*global process, module */
'use strict';
var PRINTED = Object.create(null);
var _ = require('lodash');

function env(logger, options) {
  options = _.defaults(options || {}, {
    displayValues: true
  });

  function log( /* args... */ ) {
    if (!env.DISPLAY_LOG) {
      return;
    }
    logger.info.apply(logger, arguments);
  }

  /**
   * @param  {[type]} key [description]
   * @param  {[type]} def [description]
   * @return {undefined|mixed} yield undefined if not found
   */
  function getOrElse(key, def, shouldPrintDefault) {
    shouldPrintDefault = shouldPrintDefault || false; // @todo refactor this shit

    if (!_.has(process.env, key)) {
      if (!PRINTED[key] && shouldPrintDefault) {
        PRINTED[key] = 1;
        log('[env] ' + key + ' was not defined, using default', String(def));
      }
      return def;
    }

    var val = _.isNumber(def) ? toInt(process.env[key]) : process.env[key];
    if (seemsBoolean(val)) {
      val = String(val).toLowerCase() === 'true';
    }

    if (val !== void 0) {
      if (!PRINTED[key]) {
        PRINTED[key] = 1;
        log('[env] ' + key + ' was defined' + (options.displayValues ? ', using ' + String(val) : ''));
      }
    }
    return val;
  }

  return {
    getOrElse: getOrElse,

    reset: function () {
      // @todo refactor this shit
      PRINTED = Object.create(null);
    },

    /**
     * [getOrElseAll description]
     * @param  {Object} obj pair or {"ENV_VAR": {Number|String} defaultValue, ...}
     * @return {Object}     [description]
     */
    getOrElseAll: function getOrElseAll(vars, prefix) {
      prefix = prefix || '';

      return _.reduce(vars, function (out, val, k) {
        var keyEnvName = k.toUpperCase();
        var fullKeyName = prefix + keyEnvName;

        if (_.isPlainObject(val) && _.has(val, '$default')) {
          if (!Array.isArray(val.$aliases)) {
            throw new Error('Common-env: $aliases must be defined along side $default, key: ' + fullKeyName);
          }
          /*
            "val":{
              "$default": 1,
              "$aliases": ['VAR_ENV', 'VAR_ENV2']
            }

            Will first try `VAR_ENV` then `VAR_ENV2` then `VAL` then fallback on `$default` if none of them were set
          */
          out[k] = val.$aliases.concat([fullKeyName]).reduce(function (memo, varEnvName, i, arr) {
            var isLast = i === arr.length - 1;
            // only try to get an env var if memo is undefined
            return memo === void 0 ? (isLast ? getOrElse(varEnvName, val.$default, true) : getOrElse(varEnvName, void 0, false)) : memo;
          }, void 0);

        } else if (_.isPlainObject(val)) {
          out[k] = _.extend({}, getOrElseAll(val, fullKeyName + '_'));
        } else
        if (_.isArray(val)) {
          out[k] = val.map(function (innerVal, index) {
            return getOrElseAll(innerVal, fullKeyName + '[' + index + ']_');
          });
        } else {
          out[k] = getOrElse(fullKeyName, val, true);
        }
        return out;
      }, {});
    },

    getOrDie: function (key) {
      // @todo refactor this shit.
      var r = getOrElse(key, undefined, true);
      if (r === void 0) {
        throw new Error('(env) ' + key + ' MUST be defined');
      }
      return r;
    }
  };
}

/**
 * @type {Boolean} true by default, display logs
 */
env.DISPLAY_LOG = true;

function toInt(str) {
  return parseInt(str, 10);
}

function seemsBoolean(mixed) {
  var v = String(mixed).toLowerCase();
  return v === 'true' || v === 'false';
}
module.exports = env;
