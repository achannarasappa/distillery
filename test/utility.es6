const expect = require('expect.js');
const _ = require('lodash');
const Utility = require('../lib/utility');

describe('Utility', () => {

  describe('.interpolate', () => {

    it('should replace tokens enclosed in curly braces with values', () => {

      expect(Utility.interpolateString('http://example.com?key1={token1}&key2={token2}', { token1: 'value1', token2: 'value2' })).to.be('http://example.com?key1=value1&key2=value2');

    });

    it('should not replace tokens if no value is supplied', () => {

      expect(Utility.interpolateString('http://example.com?key1={token1}&key2={token2}', { token1: 'value1' })).to.be('http://example.com?key1=value1&key2={token2}');

    });

    it('should throw an error if a string is not passed for str', () => {

      expect(Utility.interpolateString).withArgs(1000, {}).to.throwError();
      expect(Utility.interpolateString).withArgs('test', {}).to.not.throwError();

    });

    it('should throw an error if a object is not passed for obj', () => {

      expect(Utility.interpolateString).withArgs('http://example.com?key1={token1}&key2={token2}', 1000).to.throwError();
      expect(Utility.interpolateString).withArgs('http://example.com?key1={token1}&key2={token2}', {}).to.not.throwError();

    });

  });

  describe('.splitStringArray', () => {

    const cliArgs = [ 'key1=value1', 'key2=value2', 'key3=value3' ];
    const delimiter = '=';

    it('should return an object with the same number of properties as \'strings\'', () => {

      expect(_.keys(Utility.splitStringArray(delimiter, cliArgs))).to.have.length(cliArgs.length)

    });

    it('should have keys equal to the string prior to the \'delimiter\'', () => {

      expect(_.keys(Utility.splitStringArray(delimiter, cliArgs))).to.eql([ 'key1', 'key2', 'key3' ])

    });

    it('should have values equal to the string after to the \'delimiter\'', () => {

      expect(_.values(Utility.splitStringArray(delimiter, cliArgs))).to.eql([ 'value1', 'value2', 'value3' ])

    });

    it('should throw an error if \'delimiter\' is not a string.', () => {

      expect(Utility.splitStringArray).withArgs(1, cliArgs).to.throwError()

    });

    it('should throw an error if \'strings\' is not an array.', () => {

      expect(Utility.splitStringArray).withArgs(delimiter, 1).to.throwError()

    });

  })

});
