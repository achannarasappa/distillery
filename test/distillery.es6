const expect = require('expect.js');
const _ = require('lodash');
const Distillery = require('../');
const fixtures = require('./fixtures');

describe('Distillery', () => {

  const distillery = new Distillery(fixtures.still.posts);

  it('should get the version', () => {

    expect(/\d+\.\d+\.\d+/.test(Distillery.version)).to.be.ok();

  });

  describe('Constructor', () => {

    it('should be an instance of Distillery', () => {

      expect(distillery).to.be.an(Distillery);

    });

    it('should have a still property', () => {

      expect(distillery).to.have.property('still')

    });

    it('should have the specified options when an option is passed', () => {

      expect(new Distillery(fixtures.still.posts, { save_html: './test.html' }).options.save_html).to.be('./test.html');

    });

    it('should throw an error if no still is passed in', () => {

      expect(Distillery).to.throwError();

    });

  });

});
