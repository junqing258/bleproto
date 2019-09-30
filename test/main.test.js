const Long = require("long");
const ByteBuffer = require("../src/protobuf/bytebuffer");

const { expect } = require('chai');
const sinon = require('sinon');
const util = require('../src/utils/util');

const Parse = require('../src/protobuf/parser');
const Encoder = require('../src/protobuf/encoder');
const Decoder = require('../src/protobuf/decoder');

describe('BLE Protcal Tests', () => {

  // var spy = sinon.spy();
  it('decode proto file', (done) => {
    const hex = '0003000049fffffb49fffff049000017490000b6';
    const protos = {
      "required uInt8 h": 0,
      "required uInt8 r_format": 1,
      "required uInt8 channle_no": 2,
      "required int32 channle_msb": 3
    };
    // computed
    const ab = util.hex2ab(hex);
    // const uInt8Array = new Uint8Array(ab);
    const parse_protos = Parse.parse(protos);

    // console.log('parse_protos:', JSON.stringify(parse_protos));
    const msg = Decoder.decode(parse_protos, ab);
    // {"mmHg":"---","ecgSize":"1","spo2":-1,"hr":"hr","candraw":true,"format":3}

    console.log("msg:", JSON.stringify(msg));

    done();
  });

});
