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
    let offset = encodeMsg(bytebuffer, 0, protos, msg);
    if (offset > 0) {
      bytebuffer.buffer = bytebuffer.buffer.slice(0, offset);
    }
    return util.ab2hex(bytebuffer.buffer);
  }

  return null;
};


/**
 * Check if the msg follow the defination in the protos
 */
function checkMsg(msg, protos) {
  if (!protos || !msg) {
    console.warn('no protos or msg exist! msg : %j, protos : %j', msg, protos);
    return false;
  }

  for (var name in protos) {
    var proto = protos[name];

    //All required element must exist
    switch (proto.option) {
      case 'required':
        if (typeof(msg[name]) === 'undefined') {
          console.warn('no property exist for required! name: %j, proto: %j, msg: %j', name, proto, msg);
          return false;
        }
        case 'optional':
          if (typeof(msg[name]) !== 'undefined') {
            var message = protos.__messages[proto.type] || Encoder.protos['message ' + proto.type];
            if (!!message && !checkMsg(msg[name], message)) {
              console.warn('inner proto error! name: %j, proto: %j, msg: %j', name, proto, msg);
              return false;
            }
          }
          break;
        case 'repeated':
          //Check nest message in repeated elements
          var message = protos.__messages[proto.type] || Encoder.protos['message ' + proto.type];
          if (!!msg[name] && !!message) {
            for (var i = 0; i < msg[name].length; i++) {
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

function encodeMsg(bytebuffer, offset, protos, msg) {
  // const { buffer } = bytebuffer;
  for (var name in msg) {
    if (protos[name]) {
      var proto = protos[name];
      switch (proto.option) {
        case 'required':
        case 'optional':
          // offset = writeBytes(buffer, offset, encodeTag(proto.type, proto.tag));
          offset = encodeProp(msg[name], proto.type, offset, bytebuffer, protos);
          break;
        case 'repeated':
          if (!!msg[name] && msg[name].length > 0) {
            offset = encodeArray(msg[name], proto, offset, bytebuffer, protos);
          }
          break;
      }
    }
  }

  return offset;
}


function encodeProp(value, type, offset, bytebuffer, protos) {
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
    default :
			var message = protos.__messages[type] || Encoder.protos['message ' + type];
			if (message) {
				//Use a tmp buffer to build an internal msg
				// var tmpBuffer = new Buffer(Buffer.byteLength(JSON.stringify(value))*2);
				// length = 0;

				// length = encodeMsg(tmpBuffer, length, message, value);
				//Encode length
				// offset = writeBytes(buffer, offset, codec.encodeUInt32(length));
				//contact the object
				// tmpBuffer.copy(buffer, offset, 0, length);

				// offset += length;
			}
		break;
  }
}

/**
 * Encode reapeated properties, simple msg and object are decode differented
 */
function encodeArray(array, proto, offset, buffer, protos) {
  var i = 0;
  if (util.isSimpleType(proto.type)) {
    offset = writeBytes(buffer, offset, encodeTag(proto.type, proto.tag));
    offset = writeBytes(buffer, offset, codec.encodeUInt32(array.length));
    for (i = 0; i < array.length; i++) {
      offset = encodeProp(array[i], proto.type, offset, buffer);
    }
  } else {
    for (i = 0; i < array.length; i++) {
      offset = writeBytes(buffer, offset, encodeTag(proto.type, proto.tag));
      offset = encodeProp(array[i], proto.type, offset, buffer, protos);
    }
  }

  return offset;
}
