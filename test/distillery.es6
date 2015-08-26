const _ = require('lodash');
const expect = require('expect.js');
import Distillery from '../';
import * as fixtures from './fixtures';
import { DistilleryError } from '../lib/error';

describe('Distillery', () => {

  const distillery = new Distillery(fixtures.still.posts);

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

      expect(() => new Distillery()).to.throwError((error) => expect(error).to.be.a(DistilleryError));

    });

  });

});
