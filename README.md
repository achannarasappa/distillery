# Distillery  
200 proof web scraping

## Overview  
Build simple and maintainable web scrapers through configuration over code.
Create one configuration file that contains instructions for making a single HTTP request and how to distill the returned html into easily consumable objects.

## Installation  
```
npm install distillery-js --save
```

## API  
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
    * `Promise<any>` if the still has the `exchange.response[<index>].hook` set, this function will be run and the and the promise will be resolved with the return of this function.
    * `Promise<response object>` if the `exchange.response[<index>].hook` and the `models` keys are not set in the still
    * `Promise<models object>` if the `exchange.response[<index>].hook` is not set but the `models` is set, an array of data parsed by the models will be returned. This is the same data would would be returned by running `distillery.parse(html)` directly.

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
    exchange: {
      ...
    },
    models: [
      {
        name: 'postings',
        type: 'collection',
        properties: {
          title: 'td.title',
          id: 'td.postingID > small'
        },
        collectionPath: 'html > div',
      },
      {
        name: 'page',
        type: 'item',
        properties: {
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

#### `distillery.expect.http_code(code)`  
The [HTTP code](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) to expect the response to contain.
* arguments
    * `code` (*integer*, *required*) - The HTTP to expect the response to contain
* returns
    * `true` if HTTP response code matches `code` exactly
    * `false` if HTTP response code does not match `code` exactly

#### `distillery.expect.url(url)`  
* arguments
    * `url` (*string* or *regex*, *required*) - A string or regex pattern to match the final url against
* returns
    * `true` if `url` is a string and final url matches `url` exactly
    * `true` if `url` is a regex and final url matches the regex `url`
    * `false` if final url does not match `url` exactly

#### `distillery.expect.html_element(path, expected)`  
* arguments    
    * `path` (*string*) - CSS path to an HTML element.
    * `expected` (*string* or *regex*, *optional*) - If expected is not set, the function will return the contents of the element at the CSS path if found or false is not found. If expected is a string, the fuction will return true if the inner text of the element at the path matches
* returns
    * `<html element inner text>` if expected is not set and the element at the CSS path exists in the html document. This response allows for any customer validation logic to be performed in `exchange.response[<index>].predicate`.
    * `true` if `expected` is a regex, the element at the CSS path exists in the html document, and the `expected` regex pattern matches the inner text of that element
    * `true` if `expected` is a string, the element at the CSS path exists in the html document, and the `expected` string matches the inner text of that element exactly
    * `false` if the contents of the element at the CSS path does not exists in the html document
    * `false` if `expected` is a regex, the element at the CSS path exists in the html document, and the regex pattern does not match the inner text of the element
    * `false` if `expected` is a string, the element at the CSS path exists in the html document, and the `expected` string does not match the inner text of that element exactly 

## Ignite CLI  
### Overview  
The purpose of the Ignite command line interface is to make testing stills quicker and simpler. Ignite allows stills to be run from the command line with detailed output to assist developers.
### Installation  
```
npm install distillery-js -g
```
### Usage  
```
$ distillery ignite <stillPath> [-o <option>...] [-p <parameter>...]
```
#### stillPath  
The relative path to the still file
#### option  
Set distillery CLI options which are detailed below. All model options have default values shown while exchange options have no defaults.
* Exchange
    * `-o save_html=response.html` - Save HTML document to response.html
    * `-o save_cookie=response.cookie` - Save cookie set in the response to response.cookie
    * `-o restore_cookie=request.cookie` - Use cookie saved in request.cookie when making the request
* Models
    * `-o table=true` - Display detailed entities and properties
    * `-o table_item_count=10` - Number of items to display in the table of entities.
    * `-o item_max_length=50` - Number of characters after which to truncate an entity's property
    * `-o item_transform=false` - Apply the model's `transform` function to the entities, by default, the raw data returned without any custom transformation will be returned

#### parameter  
Set any parameters defined in the still's `exchange.request.query`, `exchange.request.headers`, or `exchange.request.form` section that would be normally set in the `.distill` method of the programmatic API. Parameters should follow the format of `-p <name>=<value>`
##### Example  
```
$ distillery ignite ./still.js -p id=4809527167
```

## Stills  
Stills are the configuration object that defines how to retrieve and extract data from a web page. A still is a function that returns an object with a specific structure shown here:
```javascript
module.exports = function(distillery) {
  return {
    exchange: {
      request: {
        ...
      },
      response: [
        ...
      ]
    },
    models: [
      ...
    ]
  }
};
```

#### `exchange`
(`object`, `required`) - The process object contains the definition for how to make the HTTP request and how to handle the response.
#### `exchange.request`
(`object`, `required`) - Data detailing how to complete a HTTP request.
#### `exchange.request.url`
(`string`, `required`) - URL string which may contain tokenized variables. See token section below for more information.  
#### Tokens  
Tokens are placeholders for variables in the `exchange.request.url` that can be passed into a still to modify the request. Tokens are encapsulated by `{` and `}` in the url string. These can be used to make use of the same still for multiple similar requests.
##### Example  
In this example a GitHub username is passed into the distillery instance to save the profile page of a user. The username can be modified in the example.js script to scrape any user's profile.
```javascript
// still.js
module.exports = function(distillery) {
  return {
    exchange: {
      request: {
        method: 'GET',
        url: 'https://github.com/{un}',
        query: 
            username: { name: 'un', required: true }
      }
  }
};
// example.js
var Distillery = require('distillery-js')
var still = require('./still.js')
var fs = require('fs')

Distillery(still)
  .distill({ username: 'achannarasappa' })
  .then(function(html) {
    fs.writeFileSync('user.html', html)
  })
```
Run with `$ node ./example.js`. The username variable can be modified in example.js to scrape the profile page of any github user.

#### `exchange.request.method`
(*string*, *required*) - The HTTP verb which may be `GET`, `POST`, `PUT`, or `DELETE`  
#### `exchange.request.parameters`
(*array*, *optional*) - Parameters that can be set at invokation time.
#### `exchange.request.parameters[<index>]`
(*object*, *optional*, or *string*, *optional*) - Describes a parameter that can be passed into the still. When a string is used, several default parameter properties are assigned:
```js
...
parameters: [
  'username', // Short-form
  { // Long-form
    name: 'username',
    type: 'query',
    required: false
  }
]
...
```

##### `exchange.request.parameters[<index>].name`
(*string*, *required*) - Name of the token in the url string.
##### `exchange.request.parameters[<index>].required`
(*boolean*, *optional*) - If set to true, then an error will be thrown if this variable is not set in the `Distillery(still).distill()` method.
##### `exchange.request.parameters[<index>].def`
(*string*, *optional*) - Default value for the given parameter.
##### `exchange.request.parameters[<index>].predicate`
(*function*, *optional*) - A `DistilleryValidationError` is thrown when a falsy value is returned from this function.
##### Example  
```javascript
context: {
  name: 'context',
  def: 'user',
  predicate: function(value) {
    return value === 'user' || value === 'admin';
  }
},
```
##### `exchange.request.parameters[<index>].transform`
(*function*, *optional*) - Modifies the parameter before running any validation.
##### Example  
```javascript
context: {
  name: 'context',
  def: 'user',
  transform: function(value) {
    return value * 10;
  }
},
```
##### `exchange.request.parameters[<index>].type`
(*string*, *optional*) - The parameter type. This indicates in which part of the request the parameter will be used. Possible types include:
* `query` - Parameters to be interpolated with url tokens. `name` property refers to the name that can be used to set the parameter in the `Distillery(still).distill()` method.  
* `header` - Parameters to be sent as headers. See [Request documentation](https://github.com/request/request#custom-http-headers) of headers for more information. Object key refers to the name that can be used to set the parameter in the `Distillery(still).distill()` method.  
* `form` - Send request data as `application/x-www-form-urlencoded`. See [Request documentation](https://github.com/request/request#forms) on forms for more information.  Object key refers to the name that can be used to set the parameter in the `Distillery(still).distill()` method.

##### `exchange.request.parameters[<index>].alias`
(*string*, *optional*) - An alias for the parameter. For example, the header `Content-Type` can be aliased to `content_type` to make it easier to refer to when using the `Distillery(still).distill()` method.
#### `exchange.response`
Hooks, validators, and indicators to handle a HTTP response. Each sub-object is a potential response condition. This allows for handling 404 Not Found response differently from a 200 OK response.
#### `exchange.response[<index>].indicators`
(*array*, *required*) -  Conditions to look for that would indicate this specific response was returned from the server. Each sub-key is a user-assigned name for the indicator. There are a set of indicator that can be used detailed below. Which combination or combinations of indicators constitutes a specific response is in the [`exchange.response[<index>].predicate`](#exchangeresponsekeypredicate) function.
##### Indicators  
Indicators are used to recognize if a particular response was returned. They are key value pairs where the keys are the name of the indicator and the value is an expected value in the HTTP response. There are three signatures that can be detected with distillery:
* [A specifc HTTP response code](#distilleryexpecthttp_codecode)
* [A specifc url or url pattern after redirects](#distilleryexpecturlurl)
* [A HTML element present on the page](#distilleryexpecturlurl)
* Custom indicator function

##### Example  
The first two indicators are included with distillery. The last indicator is a user defined indicator that should return true or false.
```javascript
...
  indicators: [
    distillery.expect.url('https://github.com/'),
    distillery.expect.http_code(200),
    function(response) {
        return (response.statusMessage === 'Not found')
    }
  ],
...
```

#### `exchange.response[<index>].predicate`
(*function*, *optional*) - Used to determine which response was returned from the the request. The result of each indicator can be used in this function to evaluate if the response is valid. If there are multiple responses that have validation functions that evaluate to true, the first response will be chosen.
* arguments
    * `indicators` (*object*) - Object with the same keys as defined in [response indicators](#exchangeresponsekeyindicators). The values of these keys will be either a boolean or string depending on the indicator.

##### Example  
In the `profile_success` response, there are two indicators that will be evaluated, `success_url` and `success_code`. If the predicate function returns true, the hook for this response will be triggered.
```javascript
// still.js
module.exports = function(distillery) {
  return {
    exchange: {
      request: {
        method: 'GET',
        url: 'https://github.com/{un}',
        parameters: [
          { name: 'un', alias: 'username' required: true }
        ]
      },
      response: [
        {
          name: 'profile_success',
          indicators: [
            {
              name: 'success_url',
              test: distillery.expect.url('https://github.com/')
            }
            {
              name: 'success_code',
              test: distillery.expect.http_code(200)
            }
          ],
          predicate: function(indicators) {
            return (indicators.success_code && indicators.success_url);
          },
          hook: function(response) {
            console.log('Successfully retrieved the user's profile!');
          }
        }
      ]
  }
};
```
#### `exchange.response[<index>].hook`
(*function*, *optional*) - Hook function to trigger after the response is validated. Only a single hook will be triggered in a still. If no hook is defined, 
* arguments
    * `response` (*object*) - [HTTP response object](https://nodejs.org/api/http.html#http_http_incomingmessage) plus some additional distillery data. This is almost the same as the response object returned from the [Request](https://github.com/request/request) library. There are a few additional keys: 
        * `response.indicators` (*object*) - response indicators as detailed in the [response indicators](#exchangeresponsekeyindicators) section
        * `response.hook` (*function*) - response hook as detailed in the [response hook](#exchangeresponsekeyhook) section
        * `response.jar` (*object*) - [request cookie jar](https://github.com/request/request#requestjar) with cookie that is returned with the response. This can be used to pass cookies between distills or to store a cookie for later use.

#### `models`  
(`array`, `optional`) - Array of models that define how to extract an entity from HTML
#### `models[<index>]`  
(`object`, `optional`) - Model definition for how to extract an entity from HTML
#### `models[<index>].name`  
(`string`, `required`) - Name for the model
#### `models[<index>].type`  
(`string`, `required`) -Model type which can be:
* *collection* - When an entity is expected to appear multiple times on a page, the type should be collection. A second property, *collectionPath* should be supplied if the type is collection.
* *item* - When an entity is expect to appear only once on a page, the type should be item.

#### `models[<index>].properties`  
(`object`, `required`) - Object containing all of the properties of the entites with the keys being the name of the property and value being either a string CSS path to to the HTML element or an object containing information about how to retireve the property.
#### `models[<index>].properties[<key>]`  
(*string*, *object*, or *function*, *required*) - There are several possibilities for what is returned from a model depending on the value of this key detailed below:
* `<string>` - the inner text of the HTML element at that path will be returned
* `<object>` with `attr`, `regex`, and `path` properties defined - the value of the attribute of the HTML element at the `path` which has inner text matching the regular expression `regex` will be returned
* `<object>` with `attr` and `path` properties defined - the value of the attribute of the HTML element at the `path` will be returned
* `<object>` with `regex` and `path` properties defined - the inner text of the HTML element at that path which has inner text matching the regular expression `regex` will be returned
* `<function>` - the return of the function will be returned. The first argument is a [cheerio selector](https://github.com/cheeriojs/cheerio#-selector-context-root-) with the html body loaded

##### Example
Here, distillery will run the function in `properties.title` and return the result rather than selecting a specific a CSS path as it does with `properties.id`.
```javascript
models: [
    {
        type: 'item',
        properties: {
            id: 'div.id',
            title: function($) {
                return $('div#post-list > div').eq(0).html()
            }
        }
    }
]
```

##### `models[<index>].properties[<key>].path`  
(*string*, *required*) - CSS path to a HTML element. Must also have a `attr` or `regex` property.
##### `models[<index>].properties[<key>].attr`  
(*string*, *optional*) - Name of an HTML attribute to retrieve the value from
##### `models[<index>].properties[<key>].regex`  
(*string*, *optional*) - Regular expression to test the inner text of the element at `path`
#### `models[<index>].collectionPath`  
(*string*, *required*) - Required if `type` is *collection*, otherwise not needed. The CSS path that contains the items in a collection. 
##### Example
With this snippet of a model, distillery with iterate over every `table > tr` in the HTML document and return the value from the `td.title` as an array.
```javascript
models: [
    {
        type: 'collection',
        properties: {
          title: 'td.title'
        },
        collectionPath: 'table > tr'
    }
]
```
#### `models[<index>].predicate`
(*function*, *optional*) - Validation function that should return a true value for entites that should be returned and false for entites that should be removed from the result array for collections.
#### `models[<index>].transform`
(*function*, *optional*) - Formatting function that will be run over each entity in a collection to transform its values or on a single entity for an item.
```javascript
predicate: function(posting) {
  return (typeof posting.title !== "undefined")
},
transform: function(posting) {
  posting.title = posting.title.trim();
  return posting;
}
```