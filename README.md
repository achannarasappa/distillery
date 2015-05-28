#Distillery
200 proof web scraping

##Overview
Build simple and maintainable web scrapers through configuration over code.
Create one configuration file that contains instructions for making a single HTTP request and how to distill the returned html into easily consumable objects.

##Installation
```
npm install distillery-js --save
```

##Stills
Stills are the configuration object that defines how to retrieve and extract data from a web page. A still is a function that returns an object with a specific structure shown here:
```javascript
module.exports = function(distillery) {
  return {
    process: {
      request: {
        ...
      },
      response: {
        ...
      }
    },
    models: [
      ...
    ]
  }
};
```

####`process`
The prcocess object contains the definition for how to make the HTTP request and how to handle the response.
####`process.request`
Data detailing how to complete a HTTP request.
####`process.request.url`
(`string`, `required`) - URL string which may contain tokenized variables. See token section below for more information.  
####Tokens
Tokens are placeholders for variables in the `process.request.url` that can be passed into a still to modify the request. Tokens are encapsulated by `{` and `}` in the url string. These can be used to make use of the same still for multiple similar requests.
#####Example
In this example a GitHub username is passed into the distillery instance to save the profile page of a user. The username can be modified in the example.js script to scrape any user's profile.
```javascript
// still.js
module.exports = function(distillery) {
  return {
    process: {
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

####`process.request.method`
(*string*, *required*) - The HTTP verb which may be `GET`, `POST`, `PUT`, or `DELETE`  
####`process.request.query`
(*object*, *optional*) - Parameters to be interpolated with url tokens. Object key refers to the name that can be used to set the parameter in the `Distillery(still).distill()` method.  
#####`process.request.query[<key>].name`
(*string*, *required*) - Name of the token in the url string.
#####`process.request.query[<key>].required`
(*boolean*, *optional*) - If set to true, then an error will be thrown if this variable is not set in the `Distillery(still).distill()` method.
#####`process.request.query[<key>].default`
(*string*, *optional*) - Default value for the given parameter.
####`process.request.headers`
(*object*, *optional*) - Parameters to be sent as headers. See [Request documentation](https://github.com/request/request#custom-http-headers) of headers for more information. Object key refers to the name that can be used to set the parameter in the `Distillery(still).distill()` method.  
#####`process.request.headers[<key>].name`
(*string*, *required*) - Name of the [http header](http://en.wikipedia.org/wiki/List_of_HTTP_header_fields).
#####`process.request.headers[<key>].required`
See `process.request.query[<key>].required`.
#####`process.request.headers[<key>].default`
See `process.request.query[<key>].default`.
####`process.request.payload`
(*object*, *optional*) - Send request data as `application/x-www-form-urlencoded`. See [Request documentation](https://github.com/request/request#forms) on forms for more information.  Object key refers to the name that can be used to set the parameter in the `Distillery(still).distill()` method.  
#####`process.request.payload[<key>].name`
(*string*, *required*) - Name of the form parameter.
#####`process.request.payload[<key>].required`
See `process.request.query[<key>].required`.
#####`process.request.payload[<key>].default`
See `process.request.query[<key>].default`.
####`process.response`
Hooks, validators, and indicators to handle a HTTP response. Each sub-object is a potential response condition. This allows for handling 404 Not Found response differently from a 200 OK response.
####`process.response[<key>].indicators`
(*object*, *required*) - List conditions to look for that would indicate this specific response was returned from the server. Each sub-key is a user-assigned name for the indicator. There are a set of indicator that can be used detailed below. Which combination or combinations of indicators constitues a specific response is in the [`process.response[<key>].validate`](#processresponsekeyvalidate) function.
#####Indicators
Indicator function can be used to determine if a specific response was returned from the request.
1. `distillery.expect.http_code(code)` - The [HTTP code](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) to expect the response to contain.
    * arguments
        * `code` (*integer*, *required*) - The HTTP to expect the response to contain
    * returns
        * `true` if HTTP response code matches `code` exactly
        * `false` if HTTP response code does not match `code` exactly
2. `distillery.expect.url(url)`
    * arguments
        * `url` (*string* or *regex*, *required*) - A string or regex pattern to match the final url against
    * returns
        * `true` if `url` is a string and final url matches `url` exactly
        * `true` if `url` is a regex and final url matches the regex `url`
        * `false` if final url does not match `url` exactly
3. `distillery.expect.html_element(path, expected)`
    * arguments    
        * `path` (*string*) - CSS path to an HTML element.
        * `expected` (*string* or *regex*, *optional*) - If expected is not set, the function will return the contents of the element at the CSS path if found or false is not found. If expected is a string, the fuction will return true if the inner text of the element at the path matches
    * returns
        * `<html element inner text>` if expected is not set and the element at the CSS path exists in the html document. This response allows for any customer validation logic to be performed in `process.response[<key>].validate`.
        * `true` if `expected` is a regex, the element at the CSS path exists in the html document, and the `expected` regex pattern matches the inner text of that element
        * `true` if `expected` is a string, the element at the CSS path exists in the html document, and the `expected` string matches the inner text of that element exactly
        * `false` if the contents of the element at the CSS path does not exists in the html document
        * `false` if `expected` is a regex, the element at the CSS path exists in the html document, and the regex pattern does not match the inner text of the element
        * `false` if `expected` is a string, the element at the CSS path exists in the html document, and the `expected` string does not match the inner text of that element exactly  

####`process.response[<key>].validate`
(*function*, *required*) - Used to determine which response was returned from the the request. The result of each indicator can be used in this function to evaluate if the response is valid. If there are multiple responses that have validation functions that evaluate to true, the first response will be chosen.
* arguments
    * `indicators` (*object*) - Object with the same keys as defined in [response indicators](#processresponsekeyindicators). The values of these keys will be either a boolean or string depending on the indictor.

#####Example
In the `profile_success` response, there are two indicators that will be evaluated, `success_url` and `success_code`. If the validate function returns true, the hook for this response will be triggered.
```javascript
// still.js
module.exports = function(distillery) {
  return {
    process: {
      request: {
        method: 'GET',
        url: 'https://github.com/{un}',
        query: 
            username: { name: 'un', required: true }
      },
      response: {
        profile_success: {
          indicators: {
            success_url: distillery.expect.url('https://github.com/'),
            success_code: distillery.expect.http_code(200)
          },
          validate: function(indicators) {
            return (indicators.success_code && indicators.success_url);
          },
          hook: function(response) {
            console.log('Successfully retrieved the user's profile!');
          }
        }
      }
  }
};
```
####`process.response[<key>].hook`
(*function*, *optional*) - Hook function to trigger after the response is validated. Only a single hook will be triggered in a still. If no hook is defined, 
* arguments
    * `response` (*object*) - [HTTP response object](https://nodejs.org/api/http.html#http_http_incomingmessage) plus some additional distillery data. This is almost the same as the response object returned from the [Request](https://github.com/request/request) library. There are a few additional keys: 
        * `response.indicators` (*object*) - response indicators as detailed in the [response indicators](#processresponsekeyindicators) section
        * `response.hook` (*function*) - response hook as detailed in the [response hook](#processresponsekeyhook) section
        * `response.jar` (*object*) - [request cookie jar](https://github.com/request/request#requestjar) with cookie that is returned with the response. This can be used to pass cookies between distills or to store a cookie for later use.

##API
####`Distillery(still, options)`
* arguments
    * `still` (*function*) - Distillery still. Refer to the [still section](#stills) for further information.
    * `options` (*object*) - Set distillery options
        * `options.jar` (*object*) - [request cookie jar](https://github.com/request/request#requestjar), pass a jar from previous distill to reuse the same cookie.
* returns 
    * `distillery` instance of Distillery

####`distillery.distill(parameters, returnResponse)`
* arguments
    * `parameters` (*object*, *optional*) - Parameters that modify the request. These would have been set in the `query`, `headers`, or `form` section of the still. An error will be thrown if any parameters with the required attribute are not set. The keys of this object should match the keys in the `query`, `headers`, or `form` objects.
    * `returnResponse` (*boolean*, *optional*) - Override all logic for interpreting the response and return the [response object](#processresponsekeyhook)
* returns 
    * `Promise`

####`distillery.parse(html)`
* arguments
    * `html` (*string*, *required*) - Utility function to parse any HTML and attempt to extract the data detailed in the models section of the still.
* returns 
    * The result of any models that were able to be parse from the HTML.

##Examples
See [distillery-examples](https://github.com/achannarasappa/distillery-examples)