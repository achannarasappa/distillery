const _ = require('lodash');
const expect = require('expect.js');
import IgniteExchange from '../../lib/ignite/ignite-exchange';
import Ignite from '../../lib/ignite/ignite';
import * as fixtures from '../fixtures';

describe('IgniteExchange', () => {

  const ignite = new Ignite(fixtures.still.posts);
  const definition = ignite.still.exchange;
  const igniteExchange = new IgniteExchange(definition);
  const response = fixtures.response.posts;

  describe('constructor()', () => {

    it('should set default options', () => {

      expect(igniteExchange.options).to.only.have.keys('jar', 'indicators', 'save_html', 'save_cookie', 'restore_cookie')

    });

  });

  describe('.prototype._getSummaryAnalysis()', () => {

    it('should have one array for every indicator for every response', () => {

      expect(igniteExchange._getSummaryAnalysis(response, 'success')).to.have.length(7)

    });

  });

  describe('getResponseAnalysis', () => {

    it('should have one array for every indicator in the given response', () => {

      const successIndicators = _.filter(igniteExchange._getSummaryAnalysis(response, 'success'), (indicatorAnalysis) => _.contains(indicatorAnalysis, 'success'));
      const errorIndicators = _.filter(igniteExchange._getSummaryAnalysis(response, 'success'), (indicatorAnalysis) => _.contains(indicatorAnalysis, 'error'));

      expect(successIndicators).to.have.length(4);
      expect(errorIndicators).to.have.length(3);

    });

    it('should not return any arrays with undefined elements', () => {

      const undefinedIndicators = _.filter(igniteExchange._getSummaryAnalysis(response, 'success'), (indicatorAnalysis) => _.contains(indicatorAnalysis, undefined));

      expect(undefinedIndicators).to.have.length(0);

    });

  });

  describe('getIndicatorAnalysis', () => {

    it('should return a row with a name column of \'custom\' if the indicator does not have a \'name\', \'valid\', or \'actual\' property or is not a plain object.', () => {

      const customIndicator = igniteExchange._getSummaryAnalysis(response, 'success')[3][3];

      expect(customIndicator).to.be('custom')

    });

    it('should return a row with a length of 7', () => {

      const firstIndicator = _.first(igniteExchange._getSummaryAnalysis(response, 'success'));

      expect(firstIndicator).to.have.length(7)

    });

  });

});
