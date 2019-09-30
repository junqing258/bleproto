
const { expect } = require('chai');
// const sinon = require('sinon');
const util = require('../src/protobuf/util');

const Parse = require('../src/protobuf/parser');
const Encoder = require('../src/protobuf/encoder');
const Decoder = require('../src/protobuf/decoder');

describe('BLE Protcal Tests', () => {

  // var spy = sinon.spy();
  it('Decode Protocal', (done) => {
    const hex = '0003000049fffffb49fffff049000017490000b6';
    const protos = {
      "required uInt8 h": 0,
      "required uInt8 r_format": 1,
      "required uInt8 channle_no": 2,
      "required int8 channle_msb": 3
    };
    // computed = {};
    const ab = util.hex2ab(hex);
    
    const parse_protos = Parse.parse(protos);
    const msg = Decoder.decode(parse_protos, ab);

    console.log("msg:", JSON.stringify(msg));
    expect(msg).to.have.property('r_format', 3);
    done();
  });

  it('Encode Protocal', (done) => {
    const protos = {
      "required uInt8 h": 0,
      "required uInt8 r_format": 1,
      "required uInt8 channle_no": 2,
      "required int32 channle_msb": 3
    };
    const msg = {
      "h": 0,
      "r_format": 3,
      "channle_no": 0,
      "channle_msb": 83
    };
    const parse_protos = Parse.parse(protos);

    const hex = Encoder.encode(parse_protos, msg);
    console.log('hex:', hex);
    expect(hex).to.have.string('0003');
    done();
  });

});
