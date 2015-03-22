var expect = require('expect.js');
var _ = require('lodash');
var Distillery = require('../');
var fixtures = require('./fixtures');

describe('Distillery', function() {

  var distillery = Distillery(fixtures.postings);

  it('should get the version', function() {

    expect(/\d+\.\d+\.\d+/.test(Distillery.version)).to.be.ok();

  });

  describe('Constructor', function() {

    it('should be an instance of Distillery', function() {

      expect(distillery).to.be.an(Distillery);

    });

    it('should have a still property', function() {

      expect(distillery.still).to.eql(fixtures.postings);

    });

    it('should have the specified options when an option is passed', function() {

      expect(Distillery(fixtures.postings, { save_html: './test.html' }).options.save_html).to.be('./test.html');

    });

    it('should throw an error if no still is passed in', function() {

      expect(Distillery).to.throwError();

    });

  });

});
