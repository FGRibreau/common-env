'use strict';

module.exports = {
  seems: {
    Integer: seemsInteger,
    Boolean: seemsBoolean
  },
  convert: {
    Integer: Integer,
    Boolean: Boolean
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
