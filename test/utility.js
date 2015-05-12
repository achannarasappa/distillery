var expect = require('expect.js');
var _ = require('lodash');
var Utility = require('../lib/utility');

describe('Utility', function() {

  describe('.interpolate', function() {

    it('should replace tokens enclosed in curly braces with values', function() {

      expect(Utility.interpolateString('http://example.com?key1={token1}&key2={token2}', { token1: 'value1', token2: 'value2' })).to.be('http://example.com?key1=value1&key2=value2');

    });

    it('should not replace tokens if no value is supplied', function() {

      expect(Utility.interpolateString('http://example.com?key1={token1}&key2={token2}', { token1: 'value1' })).to.be('http://example.com?key1=value1&key2={token2}');

    });

    it('should throw an error if a string is not passed for str', function() {

      expect(Utility.interpolateString).withArgs(1000, {}).to.throwError();
      expect(Utility.interpolateString).withArgs('test', {}).to.not.throwError();

    });

    it('should throw an error if a object is not passed for obj', function() {

      expect(Utility.interpolateString).withArgs('http://example.com?key1={token1}&key2={token2}', 1000).to.throwError();
      expect(Utility.interpolateString).withArgs('http://example.com?key1={token1}&key2={token2}', {}).to.not.throwError();

    });

  });

  describe('.truncateString', function() {

    it('should truncate strings longer than \'length\'', function() {

      expect(Utility.truncateString(10, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.')).to.be('Lorem ipsu...');

    });

    it('should not truncate strings less than \'length\'', function() {

      expect(Utility.truncateString(10, 'Lorem')).to.be('Lorem');

    });

    it('should throw an error if \'length\' is not a number.', function() {

      expect(Utility.truncateString).withArgs('test', 'Lorem').to.throwError();
      expect(Utility.truncateString).withArgs(10, 'Lorem').to.not.throwError();

    });

    it('should throw an error if \'str\' is not a string.', function() {

      expect(Utility.truncateString).withArgs(10, {}).to.throwError();
      expect(Utility.truncateString).withArgs(10, 0).to.not.throwError();
      expect(Utility.truncateString).withArgs(10, 'Lorem').to.not.throwError();

    });

  });

  describe('.splitStringArray', function() {

    var cliArgs = [ 'key1=value1', 'key2=value2', 'key3=value3' ];
    var delimiter = '=';

    it('should return an object with the same number of properties as \'strings\'', function() {

      expect(_.keys(Utility.splitStringArray(delimiter, cliArgs))).to.have.length(cliArgs.length)

    });

    it('should have keys equal to the string prior to the \'delimiter\'', function() {

      expect(_.keys(Utility.splitStringArray(delimiter, cliArgs))).to.eql([ 'key1', 'key2', 'key3' ])

    });

    it('should have values equal to the string after to the \'delimiter\'', function() {

      expect(_.values(Utility.splitStringArray(delimiter, cliArgs))).to.eql([ 'value1', 'value2', 'value3' ])

    });

    it('should throw an error if \'delimiter\' is not a string.', function() {

      expect(Utility.splitStringArray).withArgs(1, cliArgs).to.throwError()

    });

    it('should throw an error if \'strings\' is not an array.', function() {

      expect(Utility.splitStringArray).withArgs(delimiter, 1).to.throwError()

    });

  })

});
