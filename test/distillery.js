require('blanket');
var expect = require('expect.js');
var _ = require('lodash');
var Distillery = require('../');
var fixtures = require('./fixtures');

describe('distillery', function() {

  it('should get the version', function() {

    expect(/\d+\.\d+\.\d+/.test(Distillery.version)).to.be.ok();

  });

  it('should be an instance of Distillery', function() {
  
    expect(Distillery(fixtures.postings)).to.be.an(Distillery);
  
  });
  
  it('should have a still object when one is passed', function() {
  
    expect(Distillery(fixtures.postings).still).to.be.an(Object);
  
  });
  
  it('should have empty options when no options are passed', function() {
  
    expect(Distillery(fixtures.postings).options).to.eql({});
  
  });

  it('should have the specified options when an option is passed', function() {

    expect(Distillery(fixtures.postings, { save_html: './test.html' }).options.save_html).to.be('./test.html');

  });

  it('should throw an error if no still is passed in', function() {

    expect(Distillery).to.throwError();

  });

});
