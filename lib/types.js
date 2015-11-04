'use strict';
const _ = require('lodash');

module.exports = {
  seems: {
    Integer: seemsInteger,
    Boolean: seemsBoolean,
    String: seemsString
  },
  convert: {
    Integer: Integer,
    Boolean: Boolean,
    String: String,
  }
};


function Integer(mixed) {
  if (!seemsInteger(mixed)) {
    throw new Error('`' + mixed + '` is not an integer, could not convert it.');
  }
  return parseInt(mixed, 10);
}

function seemsInteger(mixed){
  var maybeInt = parseInt(mixed, 10);
  return !isNaN(maybeInt) && mixed + '' === maybeInt.toFixed(0);
}

function Boolean(mixed) {
  if (!seemsBoolean(mixed)) {
    throw new Error('`' + mixed + '` is not an boolean, could not convert it.');
  }

  return String(mixed).toLowerCase() === 'true';
}

function seemsBoolean(mixed) {
  var v = String(mixed).toLowerCase();
  return v === 'true' || v === 'false';
}

function String(mixed){
  if(!seemsString(mixed)){
    throw new Error('`' + mixed + '` is not an string, could not convert it.');
  }

  return mixed;
}

function seemsString(mixed){
  return _.isString(mixed);
}
