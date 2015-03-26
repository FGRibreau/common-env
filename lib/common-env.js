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

  return {
    getOrElse: function (key, def) {
      if (process.env[key]) {
        var val = _.isNumber(def) ? toInt(process.env[key]) : process.env[key];

        if (seemsBoolean(val)) {
          val = String(val).toLowerCase() === 'true';
        }

        if (!PRINTED[key]) {
          PRINTED[key] = 1;
          log('[env] ' + key + ' was defined' + (options.displayValues ? ', using ' + String(val) : ''));
        }

        return val;
      }

      if (!PRINTED[key]) {
        PRINTED[key] = 1;
        log('[env] ' + key + ' was not defined, using default', String(def));
      }
      return def;
    },

    /**
     * [getOrElseAll description]
     * @param  {Object} obj pair or {"ENV_VAR": {Number|String} defaultValue, ...}
     * @return {Object}     [description]
     */
    getOrElseAll: function (vars, prefix) {
      prefix = prefix || '';

      return _.reduce(vars, function (out, val, k) {
        var keyEnvName = k.toUpperCase();

        if (_.isPlainObject(val)) {
          out[k] = _.extend({}, this.getOrElseAll(val, prefix + keyEnvName + '_'));
        } else if (_.isArray(val)) {
          out[k] = val.map(function (innerVal, index) {
            return this.getOrElseAll(innerVal, prefix + keyEnvName + '[' + index + ']_');
          }, this);
        } else {
          out[k] = this.getOrElse(prefix + keyEnvName, val);
        }
        return out;
      }.bind(this), {});
    },

    getOrDie: function (key) {
      // @todo refactor this shit.
      var r = this.getOrElse(key, false);
      if (r === false) {
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
