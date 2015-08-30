#### `Distillery(still, options)`  
* arguments
    * `still` (*function*) - Distillery still. Refer to the [still section](#stills) for further information.
    * `options` (*object*) - Set distillery options
        * `options.jar` (*object*) - [request cookie jar](https://github.com/request/request#requestjar), pass a jar from previous distill to reuse the same cookie.
        * `options.requestOptions` (*object*) - [request options object](https://github.com/request/request#requestoptions-callback), pass any options directly to request. Request options normally used by Distillery will be filled in as defaults if not supplied through the options object.
* returns 
    * `distillery` instance of Distillery

#### `distillery.distill(parameters, returnResponse)`  
* arguments
    * `parameters` (*object*, *optional*) - Parameters that modify the request. These would have been set in the `query`, `headers`, or `form` section of the still. An error will be thrown if any parameters with the required attribute are not set. The keys of this object should match the keys in the `query`, `headers`, or `form` objects.
    * `returnResponse` (*boolean*, *optional*) - Override all logic for interpreting the response and return the [response object](https://nodejs.org/api/http.html#http_http_incomingmessage)
* returns 
    * `Promise<response object>` if returnResponse is set to `true`
    * `Promise<response object>` if any error is returned. The `response.error` will be set along with the rest of the [response object](https://nodejs.org/api/http.html#http_http_incomingmessage).
    * `Promise<any>` if the still has the `process.response[<key>].hook` set, this function will be run and the and the promise will be resolved with the return of this function.
    * `Promise<response object>` if the `process.response[<key>].hook` and the `models` keys are not set in the still
    * `Promise<models object>` if the `process.response[<key>].hook` is not set but the `models` is set, an array of data parsed by the models will be returned. This is the same data would would be returned by running `distillery.parse(html)` directly.

#### `distillery.parse(html)`  
* arguments
    * `html` (*string*, *required*) - Utility function to parse any HTML and attempt to extract the data detailed in the models section of the still.
* returns 
    * `<Array>` The result of any models that were able to be parsed from the HTML.

##### Example  
```javascript
// still.js
module.exports = function(distillery) {
  return {
    process: {
      ...
    },
    models: [
      {
        name: 'postings',
        type: 'collection',
        elements: {
          title: 'td.title',
          id: 'td.postingID > small'
        },
        iterate: 'html > div',
      },
      {
        name: 'page',
        type: 'item',
        elements: {
          current: '.current_page',
          last: '.last_page'
        }
      }
    ]
  }
};

// test.js
var Distillery = require('distillery-js')
var still = require('./still.js')

console.log(Distillery(still).parse(html))
```

```sh
$ node test.js
[
    {
        current: 1,
        last: 10
    },
    [
        {
            id: 100
            title: 'A post title'
        },
        {
            id: 101
            title: 'Another post title'
        },
        {
            id: 102
            title: 'One more post title'
        }
    ]
]
```