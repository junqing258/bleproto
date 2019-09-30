/* eslint-disable no-fallthrough */
const ByteBuffer = require("./bytebuffer");
const util = require("./util");

const Encoder = module.exports;

Encoder.encode = function(protos, msg) {
  //Check msg
  if (!checkMsg(msg, protos)) {
    console.warn('check msg failed! msg : %j, proto : %j', msg, protos);
    return null;
  }

  var length = util.byteLength(JSON.stringify(msg)) * 2;
  var bytebuffer = new ByteBuffer(length);
  if (protos) {
    encodeMsg(bytebuffer, protos, msg);
    if (bytebuffer.offset > 0) {
      bytebuffer.buffer = bytebuffer.buffer.slice(0, bytebuffer.offset);
    }
    return util.ab2hex(bytebuffer.buffer);
  }

  return null;
};


function checkMsg(msg, protos) {
  if (!protos || !msg) {
    console.warn('no protos or msg exist! msg : %j, protos : %j', msg, protos);
    return false;
  }

  for (var name in protos) {
    let proto = protos[name];
    let message;

    //All required element must exist
    switch (proto.option) {
      case 'required':
        if (typeof(msg[name]) === 'undefined') {
          console.warn('no property exist for required! name: %j, proto: %j, msg: %j', name, proto, msg);
          return false;
        }
        // break;
      case 'optional':
        if (typeof(msg[name]) !== 'undefined') {
          message = protos.__messages[proto.type];// || Encoder.protos['message ' + proto.type];
          if (!!message && !checkMsg(msg[name], message)) {
            console.warn('inner proto error! name: %j, proto: %j, msg: %j', name, proto, msg);
            return false;
          }
        }
        break;
      case 'repeated':
        message = protos.__messages[proto.type] || Encoder.protos['message ' + proto.type];
        if (!!msg[name] && !!message) {
          for (let i = 0; i < msg[name].length; i++) {
            if (!checkMsg(msg[name][i], message)) {
              return false;
            }
          }
        }
        break;
    }
  }

  return true;
}

function encodeMsg(bytebuffer, protos, msg) {
  for (var name in msg) {
    if (protos[name]) {
      var proto = protos[name];
      switch (proto.option) {
        case 'required':
        case 'optional':
          encodeProp(msg[name], proto.type, bytebuffer, protos);
          break;
        case 'repeated':
          if (!!msg[name] && msg[name].length > 0) {
            encodeArray(msg[name], proto, bytebuffer, protos);
          }
          break;
      }
    }
  }
}


function encodeProp(value, type, bytebuffer, protos) {
  switch (type) {
    case 'uInt8':
    case 'byte':
      return bytebuffer.writeUint8(value);
    case 'int8':
      return bytebuffer.writeInt8(value);
    case 'char':
      return bytebuffer.writeInt8(String(value).charCodeAt(0));
    case 'uInt16':
      return bytebuffer.writeUint16(value);
    case 'int16':
      return bytebuffer.writeInt16(value);
    case 'uInt32':
      return bytebuffer.writeUint32(value);
    case 'int32':
      return bytebuffer.writeInt32(value);
    case 'float':
      return bytebuffer.writeFloat(value);
    case 'double':
      return bytebuffer.writeDouble(value);
    default:
      var message = protos.__messages[type] || Encoder.protos['message ' + type];
      if (message) {
        encodeMsg(bytebuffer, message, value);
      }
      break;
  }
}

function encodeArray(array, proto, bytebuffer, protos) {
  bytebuffer.writeUint32(array.length);
  for (let i = 0; i < array.length; i++) {
    encodeProp(array[i], proto.type, bytebuffer, protos);
  }
}
