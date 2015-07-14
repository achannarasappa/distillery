import IgniteModel from '../../lib/ignite/ignite-model';
const expect = require('expect.js');
const cheerio = require('cheerio');
const _ = require('lodash');
const Ignite = require('../../lib/ignite/ignite');
const fixtures = require('../fixtures');

describe('IgniteProcess', () => {

  const ignite = new Ignite(fixtures.still.posts);
  const itemDefinition = ignite.still.models[1];
  const itemIgniteModel = new IgniteModel(itemDefinition);
  const iterationDefinition = ignite.still.models[0];
  const iterationIgniteModel = new IgniteModel(iterationDefinition);
  const collectionDefinition = ignite.still.models[0];
  const collectionIgniteModel = new IgniteModel(collectionDefinition);
  const response = fixtures.response.posts;
  const $ = cheerio.load(response.body);
  const iterationTableString = [
    '┌──────┬──────────────────────────────────────────┬───────────────────────┐\n',
    '│ id   │ title                                    │ category              │\n',
    '├──────┼──────────────────────────────────────────┼───────────────────────┤\n',
    '│ 1000 │ Help computer!                           │ forum/tech/posts/1000 │\n',
    '├──────┼──────────────────────────────────────────┼───────────────────────┤\n',
    '│ 1001 │ Why is Windows so slow?                  │ forum/tech/posts/1001 │\n',
    '├──────┼──────────────────────────────────────────┼───────────────────────┤\n',
    '│ 1002 │ How can I get rid of all these toolbars? │ forum/tech/posts/1002 │\n',
    '├──────┼──────────────────────────────────────────┼───────────────────────┤\n',
    '│      │                                          │ not found             │\n',
    '└──────┴──────────────────────────────────────────┴───────────────────────┘',
  ].join('');
  const collectionTableString = [
    '┌──────┬──────────────────────────────────────────┬──────────┐\n',
    '│ id   │ title                                    │ category │\n',
    '├──────┼──────────────────────────────────────────┼──────────┤\n',
    '│ 1000 │ Help computer!                           │ tech     │\n',
    '├──────┼──────────────────────────────────────────┼──────────┤\n',
    '│ 1001 │ Why is Windows so slow?                  │ tech     │\n',
    '├──────┼──────────────────────────────────────────┼──────────┤\n',
    '│ 1002 │ How can I get rid of all these toolbars? │ tech     │\n',
    '└──────┴──────────────────────────────────────────┴──────────┘',
  ].join('');
  const itemTableString = [
    '┌─────────┬────┐\n',
    '│ current │ 1  │\n',
    '├─────────┼────┤\n',
    '│ last    │ 10 │\n',
    '└─────────┴────┘',
  ].join('');
  const summaryTableString = [
    '┌────────────┬───┐\n',
    '│ Total      │ 4 │\n',
    '├────────────┼───┤\n',
    '│ ✗ Rejected │ 1 │\n',
    '├────────────┼───┤\n',
    '│ ✓ Valid    │ 3 │\n',
    '└────────────┴───┘',
  ].join('');

  describe('constructor()', () => {

    it('should set default options', () => {

      expect(itemIgniteModel.options).to.only.have.keys('table', 'table_item_count', 'item_max_length', 'item_format')

    });

  });

  describe('.prototype._buildItemTable()', () => {

    it('should generate the string for an item table', () => {

      const item = itemIgniteModel._parseItem($);

      expect(itemIgniteModel._buildItemTable(item)).to.be(itemTableString)

    });

  });

  describe('.prototype._buildCollectionTable()', () => {

    it('should generate the string for an collection table', () => {

      const collection = collectionIgniteModel._parseCollection($);

      expect(collectionIgniteModel._buildCollectionTable(collection)).to.be(collectionTableString)

    });

  });

  describe('.prototype._buildIterationTable()', () => {

    it('should generate the string for an iteration table', () => {

      const iteration = iterationIgniteModel._parseIteration($);

      expect(iterationIgniteModel._buildIterationTable(iteration)).to.be(iterationTableString)

    });

  });

  describe('.prototype._buildSummaryTable()', () => {

    it('should generate the string for an iteration table', () => {

      const collection = collectionIgniteModel._parseCollection($);
      const iteration = iterationIgniteModel._parseIteration($);

      expect(collectionIgniteModel._buildSummaryTable(collection.length, iteration.length)).to.be(summaryTableString)

    });

  });

});
