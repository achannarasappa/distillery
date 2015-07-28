const expect = require('expect.js');
const _ = require('lodash');
const cheerio = require('cheerio');
import Distillery from '../lib/distillery';
import Model from '../lib/model';
const fixtures = require('./fixtures');

describe('Model', () => {

  const distillery = new Distillery(fixtures.still.posts);
  const itemDefinition = fixtures.still.posts(distillery).models[1];
  const itemModel = new Model(itemDefinition);
  const itemObject = fixtures.objects.posts[1];
  const collectionDefinition = fixtures.still.posts(distillery).models[0];
  const collectionModel = new Model(collectionDefinition);
  const collectionObject = fixtures.objects.posts[0];
  const html = fixtures.html.posts;
  const $ = cheerio.load(html);

  describe('Constructor', () => {

    it('should be an instance of Model', () => {

      expect(collectionModel).to.be.an(Model);

    });

    it('should extend model with the definition', () => {

      expect(itemDefinition.name).to.eql(itemDefinition.name);
      expect(itemDefinition.type).to.eql(itemDefinition.type);
      expect(itemDefinition.elements).to.eql(itemDefinition.elements);

    });

  });

  describe('.prototype.parse', () => {

    it('should return an array of objects if model.type is \'collection\'', () => {

      expect(collectionModel.parse(html)).to.eql(collectionObject);

    });

    it('should return an object if model.type is \'item\'', () => {

      expect(itemModel.parse(html)).to.eql(itemObject);

    });

  });

  describe('.prototype._parseCollection', () => {

    it('should return an array with no null elements', () => {

      expect(collectionModel._parseCollection($)).to.not.contain(null)

    });

  });

  describe('.prototype._applyFilters', () => {

    it('should return null if both model.validate and model.format are defined and model.validate returns false', () => {

      expect(collectionModel._applyFilters({ title: 'How do I change the oil on a 2007 Honda CRV?', category: 'forum/cars/posts/2046' })).to.be(null);

    });

    it('should return the formatted item if both model.validate and model.format are defined and model.validate returns true', () => {

      expect(collectionModel._applyFilters({ id: 2046, title: 'How do I change the oil on a 2007 Honda CRV?', category: 'forum/cars/posts/2046' })).to.eql({ id: 2046, title: 'How do I change the oil on a 2007 Honda CRV?', category: 'cars' });

    });

    it('should return null if model.validate is defined and model.format is not defined and model.validate returns false', () => {

      expect(new Model(_.omit(collectionDefinition, 'format'))._applyFilters({ title: 'How do I change the oil on a 2007 Honda CRV?', category: 'forum/cars/posts/2046' })).to.be(null);

    });

    it('should return the item if model.validate is defined and model.format is not defined and model.validate returns true', () => {

      expect(new Model(_.omit(collectionDefinition, 'format'))._applyFilters({ id: 2046, title: 'How do I change the oil on a 2007 Honda CRV?', category: 'forum/cars/posts/2046' })).to.eql({ id: 2046, title: 'How do I change the oil on a 2007 Honda CRV?', category: 'forum/cars/posts/2046' });

    });

    it('should return the formatted item if model.validate is not defined and model.format is defined', () => {

      expect(new Model(_.omit(collectionDefinition, 'validate'))._applyFilters({ id: 2046, title: 'How do I change the oil on a 2007 Honda CRV?', category: 'forum/cars/posts/2046' })).to.eql({ id: 2046, title: 'How do I change the oil on a 2007 Honda CRV?', category: 'cars' });
      expect(new Model(_.omit(collectionDefinition, 'validate'))._applyFilters({ title: 'How do I change the oil on a 2007 Honda CRV?', category: 'forum/cars/posts/2046' })).to.eql({ title: 'How do I change the oil on a 2007 Honda CRV?', category: 'cars' });

    });

    it('should return the item if model.validate is not defined and model.format is not defined', () => {

      expect(new Model(_.omit(collectionDefinition, [ 'validate', 'format' ]))._applyFilters({ id: 2046, title: 'How do I change the oil on a 2007 Honda CRV?', category: 'forum/cars/posts/2046' })).to.eql({ id: 2046, title: 'How do I change the oil on a 2007 Honda CRV?', category: 'forum/cars/posts/2046' });
      expect(new Model(_.omit(collectionDefinition, [ 'validate', 'format' ]))._applyFilters({ title: 'How do I change the oil on a 2007 Honda CRV?', category: 'forum/cars/posts/2046' })).to.eql({ title: 'How do I change the oil on a 2007 Honda CRV?', category: 'forum/cars/posts/2046' });

    });

  });

  describe('.prototype._parseIteration', () => {

    it('should wrap each iteration in <html></html> tags', () => {

      const postHTML = [
        [
          '<html>',
            '<div class="id">1000</div>',
            '<a class="title" href="forum/tech/posts/1000">Help computer!</a>',
          '</html>'
        ].join(''),
        [
          '<html>',
            '<div class="id">1001</div>',
            '<a class="title" href="forum/tech/posts/1001">Why is Windows so slow?</a>',
          '</html>'
        ].join(''),
        [
          '<html>',
            '<div class="id">1002</div>',
            '<a class="title" href="forum/tech/posts/1002">How can I get rid of all these toolbars?</a>',
          '</html>'
        ].join(''),
        [
          '<html>',
            '<a class="current">1</a>',
            '<a class="last">10</a>',
          '</html>'
        ].join('')
      ];

      expect(collectionModel._parseIteration($)[0].html()).to.eql(postHTML[0]);
      expect(collectionModel._parseIteration($)[1].html()).to.eql(postHTML[1]);
      expect(collectionModel._parseIteration($)[2].html()).to.eql(postHTML[2]);
      expect(collectionModel._parseIteration($)[3].html()).to.eql(postHTML[3]);

    });

  });

  describe('.prototype._parseItem', () => {

    it('should return an object with all values as strings', () => {

      expect(itemModel._parseItem($)).to.eql({ current: 1, last: 10 })

    });

  });

  describe('parseElement', () => {

    const itemDefinitionRegexAttr = {
      name: 'post1000',
      type: 'item',
      elements: {
        id: 'div.id',
        title: {
          path: 'a.title',
          attr: 'href',
          regex: /computer/
        },
        category: {
          path: 'a.title',
          attr: 'href'
        }
      }
    };

    const itemDefinitionRegex = {
      name: 'post1000',
      type: 'item',
      elements: {
        id: 'div.id',
        title: {
          path: 'a.title',
          regex: /computer/
        },
        category: {
          path: 'a.title',
          attr: 'href'
        }
      }
    };

    const itemDefinitionAttr = {
      name: 'post1000',
      type: 'item',
      elements: {
        id: 'div.id',
        title: 'a.title',
        category: {
          path: 'a.title',
          attr: 'href'
        }
      }
    };

    const itemDefinitionFunction = {
      name: 'post1000',
      type: 'item',
      elements: {
        id: 'div.id',
        title: ($) => $('div#post-list > div').eq(0).html(),
        category: {
          path: 'a.title',
          attr: 'href'
        }
      }
    };

    it('should return result of a user defined function with a cheerio selector at the first argument', () => {

      expect(new Model(itemDefinitionFunction)._parseItem($).title).to.be('<div class="id">1000</div><a class="title" href="forum/tech/posts/1000">Help computer!</a>')

    });

    it('should return the attribute text of the first occurrence of the element that matches \'regex\' if the element is an object and has the properties \'regex\' and \'attr\'', () => {

      expect(new Model(itemDefinitionRegexAttr)._parseItem($).title).to.be('forum/tech/posts/1000')

    });

    it('should return the inner text of the first occurrence of the element that matches \'regex\' if the element is an object and has the property \'regex\' and no \'attr\' property', () => {

      expect(new Model(itemDefinitionRegex)._parseItem($).title).to.be('Help computer!')

    });

    it('should return the attribute text of the first occurrence of the element if the element is an object and has the property \'attr\' and no \'regex\' property', () => {

      expect(new Model(itemDefinitionAttr)._parseItem($).category).to.be('forum/tech/posts/1000')

    });

    it('should return the inner text of the first occurrence of the element if the element is string', () => {

      expect(new Model(itemDefinitionAttr)._parseItem($).id).to.be('1000')

    });

  });

});
