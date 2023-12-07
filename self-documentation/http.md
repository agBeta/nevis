## Cacheable Response

See https://www.rfc-editor.org/rfc/rfc9110#field.last-modified. An origin server SHOULD send Last-Modified for any selected representation for which a last modification date can be reasonably and consistently determined, since its use in conditional requests and evaluating cache freshness ([CACHING]) can substantially reduce unnecessary transfers and significantly improve service availability and scalability.


## Status codes in HTTP
https://www.rfc-editor.org/rfc/rfc7231#section-6.1.


</br>

## Allow Header in 405
According to https://www.rfc-editor.org/rfc/rfc7231#section-7.4.1, An origin server MUST generate an Allow field in a 405 (Method Not Allowed) response and MAY do so in any other response.


## Why 409 for email already exists? Why not 400?
Comment by Wrikken in https://stackoverflow.com/a/3826024:  400 => "The request could not be understood by the server due to malformed syntax". And the server understands perfectly, but is unable to comply due to a conflict. There is nothing wrong with the request & syntax, only a data problem. A 400 would instantly make me believe the whole mechanism I'm using is flawed, instead of just the data.  
I return HTTP 409 with a Location header pointing to the existing/conflicting resource. –  Gili.

