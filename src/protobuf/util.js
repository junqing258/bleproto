var util = module.exports;

util.isSimpleType = function(type) {
  return (type === 'uInt32' ||
    type === 'sInt32' ||
    type === 'int32' ||
    type === 'uInt64' ||
    type === 'sInt64' ||
    type === 'float' ||
    type === 'double');
};

util.equal = function(obj0, obj1) {
  for (var key in obj0) {
    var m = obj0[key];
    var n = obj1[key];

    if (typeof(m) === 'object') {
      if (!util.equal(m, n)) {
        return false;
      }
    } else if (m !== n) {
      return false;
    }
  }

  return true;
};

util.byteLength = function(str) {
  var s = str.length;
  for (var i=str.length-1; i>=0; i--) {
    var code = str.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff) s++;
    else if (code > 0x7ff && code <= 0xffff) s+=2;
    if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
  }
  return s;
}
