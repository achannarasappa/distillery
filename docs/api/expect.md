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
    * `<html element inner text>` if expected is not set and the element at the CSS path exists in the html document. This response allows for any customer validation logic to be performed in `process.response[<key>].validate`.
    * `true` if `expected` is a regex, the element at the CSS path exists in the html document, and the `expected` regex pattern matches the inner text of that element
    * `true` if `expected` is a string, the element at the CSS path exists in the html document, and the `expected` string matches the inner text of that element exactly
    * `false` if the contents of the element at the CSS path does not exists in the html document
    * `false` if `expected` is a regex, the element at the CSS path exists in the html document, and the regex pattern does not match the inner text of the element
    * `false` if `expected` is a string, the element at the CSS path exists in the html document, and the `expected` string does not match the inner text of that element exactly 