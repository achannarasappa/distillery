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
  const postsIndex = (distillery) => ({
    exchange: {
      request: {
        url: 'http://example.com/forum/tech',
        method: 'GET',
      },
      response: [
        {
          indicators: [
            distillery.expect.html_element('title', 'Technology'),
            distillery.expect.url('http://example.com/forum/tech'),
            distillery.expect.http_code(200),
            (response) => true,
          ],
          validate: (indicators) => indicators[0],
        },
        {
          indicators: [
            distillery.expect.html_element('title', 'Something went wrong'),
            distillery.expect.url('http://example.com/error'),
            distillery.expect.http_code(400),
          ],
          validate: (indicators) => indicators[0] && indicators[1],
        },
      ],
    }
  });
  const igniteIndex = new Ignite(postsIndex);
  const definitionIndex = igniteIndex.still.exchange;
  const igniteExchangeIndex = new IgniteExchange(definitionIndex);

  describe('constructor()', () => {

    it('should set default options', () => {

      expect(igniteExchange.options).to.only.have.keys('jar', 'indicators', 'save_html', 'save_cookie', 'restore_cookie')

    });

    it('should add the index property to each response', () => {

      expect(_.pluck(igniteExchangeIndex.response, 'index')).to.eql([ 0, 1 ])

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

    it('should return the index of the response if the name property is undefined', () => {

      const successIndicators = _.filter(igniteExchangeIndex._getSummaryAnalysis(response, 0), (indicatorAnalysis) => _.contains(indicatorAnalysis, 0));
      const errorIndicators = _.filter(igniteExchangeIndex._getSummaryAnalysis(response, 0), (indicatorAnalysis) => _.contains(indicatorAnalysis, 1));

      expect(successIndicators).to.have.length(4);
      expect(errorIndicators).to.have.length(3);

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
