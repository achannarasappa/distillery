const _ = require('lodash').mixin(require('../lib/mixin'));
const expect = require('expect.js');

describe('mixin', () => {

  describe('.interpolate', () => {

    it('should replace tokens enclosed in curly braces with values', () => {

      expect(_.interpolate('http://example.com?key1={token1}&key2={token2}', { token1: 'value1', token2: 'value2' })).to.be('http://example.com?key1=value1&key2=value2');

    });

    it('should not replace tokens if no value is supplied', () => {

      expect(_.interpolate('http://example.com?key1={token1}&key2={token2}', { token1: 'value1' })).to.be('http://example.com?key1=value1&key2={token2}');

    });

  });

  describe('.splitStringArray', () => {

    const cliArgs = [ 'key1=value1', 'key2=value2', 'key3=value3' ];
    const delimiter = '=';

    it('should return an object with the same number of properties as \'strings\'', () => {

      expect(_.keys(_.splitStringArray(delimiter, cliArgs))).to.have.length(cliArgs.length)

    });

    it('should have keys equal to the string prior to the \'delimiter\'', () => {

      expect(_.keys(_.splitStringArray(delimiter, cliArgs))).to.eql([ 'key1', 'key2', 'key3' ])

    });

    it('should have values equal to the string after to the \'delimiter\'', () => {

      expect(_.values(_.splitStringArray(delimiter, cliArgs))).to.eql([ 'value1', 'value2', 'value3' ])

    });

  })

});
