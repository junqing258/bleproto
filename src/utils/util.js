function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(new Uint8Array(buffer), function(bit) {
    return ("00" + bit.toString(16)).slice(-2);
  });
  return hexArr.join("");
}

function hex2ab(hex) {
  var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function(h) {
      return parseInt(h, 16);
  }));
  return typedArray.buffer;
}

function buffer2Str(buffer) {
  let hexArr = Array.prototype.map.call(new Uint8Array(buffer), function(bit) {
    return ("00" + bit.toString(16)).slice(-2);
  });
  return `${hexArr[0]}:${hexArr[1]}:${hexArr[2]}:${hexArr[3]}:${hexArr[4]}:${hexArr[5]}`
    .toUpperCase();
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length);
  var bufView = new Uint8Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str[i];
  }
  return buf;
}

// Convert a hex string to a byte array
function hex2Bytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

// Convert a byte array to a hex string
function bytes2Hex(bytes) {
  for (var hex = [], i = 0; i < bytes.length; i++) {
      var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
      hex.push((current >>> 4).toString(16));
      hex.push((current & 0xF).toString(16));
  }
  return hex.join("");
}

function byteLength(str) {
  var s = str.length;
  for (var i=str.length-1; i>=0; i--) {
    var code = str.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff) s++;
    else if (code > 0x7ff && code <= 0xffff) s+=2;
    if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
  }
  return s;
}

module.exports = {
  byteLength,
  ab2hex,
  hex2ab,
  hex2Bytes,
  bytes2Hex
};