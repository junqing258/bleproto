// var util = require('./util');
const ByteBuffer = require("./bytebuffer");

const Decoder = module.exports;

let offset = 0,
  tags = [],
  bytebuffer;

/**
 * @param {Object} protos
 * @param {ArrayBuffer} ab
 */
Decoder.decode = function(protos, ab) {
  let msg = Object.create(null);
  let length = ab.byteLength;

  bytebuffer = new ByteBuffer(ab);
  tags = Object.keys(protos.__tags).sort();

  decodeMsg(msg, protos, length);
  return msg;
};

function decodeMsg(msg, protos, length) {
  while (offset < length) {
    var head = getHead(protos);
    var name = protos.__tags[head.tag];

    if (!name) break;
    switch (protos[name].option) {
      case 'optional':
      case 'required':
        msg[name] = decodeProp(protos[name].type, protos);
        break;
      case 'repeated':
        if (!msg[name]) {
          msg[name] = [];
        }
        // decodeArray(msg[name], protos[name].type, protos);
        break;
    }
  }
  return msg;
}

function decodeProp(type, protos) {
  switch (type) {
    case 'uInt8':
    case 'byte':
      return bytebuffer.readUint8();
    case 'int8':
      return bytebuffer.readInt8();
    case 'char':
      return String.fromCharCode(bytebuffer.readInt8());
    case 'uInt16':
      return bytebuffer.readUint16();
    case 'int16':
        return bytebuffer.readInt16();
    case 'uInt32':
        return bytebuffer.readUint32(); 
    case 'int32':
        return bytebuffer.readInt32();
    case 'float':
        return bytebuffer.readFloat();
    case 'double':
        return bytebuffer.readDouble();
    default:
      var message = protos && (protos.__messages[type] || Decoder.protos['message ' + type]);
      if (message) {
        var msg = {};
        decodeMsg(msg, message);
        return msg;
      }
      break;
  }
}

// function decodeArray(array, type, protos){
// 	if(util.isSimpleType(type)){
// 		var length = codec.decodeUInt32(getBytes());

// 		for(var i = 0; i < length; i++){
// 			array.push(decodeProp(type));
// 		}
// 	}else{
		// array.push(decodeProp(type, protos));
// 	}
// }

function getHead() { 
  var tag = tags.shift();
  return {
    tag
  };
}
