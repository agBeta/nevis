## Cacheable Response

See https://www.rfc-editor.org/rfc/rfc9110#field.last-modified. An origin server SHOULD send Last-Modified for any selected representation for which a last modification date can be reasonably and consistently determined, since its use in conditional requests and evaluating cache freshness ([CACHING]) can substantially reduce unnecessary transfers and significantly improve service availability and scalability.

## Status codes in HTTP

https://www.rfc-editor.org/rfc/rfc7231#section-6.1.
The one below obsoletes the above.
https://www.rfc-editor.org/rfc/rfc9110#name-status-codes.

</br>

## Allow Header in 405

According to https://www.rfc-editor.org/rfc/rfc7231#section-7.4.1, An origin server MUST generate an Allow field in a 405 (Method Not Allowed) response and MAY do so in any other response.

## Why 409 for email already exists? Why not 400?

Comment by Wrikken in https://stackoverflow.com/a/3826024: 400 => "The request could not be understood by the server due to malformed syntax". And the server understands perfectly, but is unable to comply due to a conflict. There is nothing wrong with the request & syntax, only a data problem. A 400 would instantly make me believe the whole mechanism I'm using is flawed, instead of just the data.

I return HTTP 409 with a Location header pointing to the existing/conflicting resource. – Gili.

</br>

## Fundamental

### Idempotent POST, PUT

https://stackoverflow.com/questions/33249708/can-a-restful-post-method-be-implemented-to-be-idempotent.
If a POST creates a new resource, then it SHOULD send a 201 (Created) response containing a Location header identifying the created resource.

According to https://stackoverflow.com/questions/442678/preventing-double-http-post:  
sud_shan comment:: Your solution to the problem is fine. But a hidden field can be viewed by client and can be edited by him to spoil our application which may accept double form again. I am searching for a solution which is completely oriented to server.  
Dherik comment:: If you have some load balancer, send a UUID (or any type of unique number) to the server to store and read again will not work well if the server is not aware about other servers, because each request could be processed by a different server.
Detection of duplicates is a kludge, and can get very complicated. Genuine distinct but similar requests can arrive at the same time, perhaps because a network connection is restored.

**Very very good technique**
Quoting from https://docs.google.com/document/d/1s0joc0yb6kXpXZGfdE9SRutoPQuK9RVa77f92xsXzrM/edit:
For any given request, a client, in the absence of a definitive result, may not know if the request fell in the water on its way, or if the response fell in the water on its way back.  
If the don’t get a response to a PUT or DELETE, how do they replay the request without wiping out other people’s modifications that may have happened between times?
Also from document: ... To be thorough, a good please-be-patient response should contain an expected delay and/or a cancel link ...
https://stackoverflow.com/a/35429135/0.
Also comment by bbsimonbb (author of article above): "Awfully" is a bit strong ! Responses will be tiny, a fraction of a kilobyte. If you had huge volumes, you could use an ACID key value store (couchDB?) just for storing respones. The payments web-service where I first used this pattern has been ticking away happily for 15 years atop a SQL Server DB. It's so simple to develop, to integrate with and to support that I find myself agog at the other answers to this problem. You can't not have noticed: Among all the RESTful discussion of how you should deal with this, no-one talks about their experience, their problems, their volumes. – bbsimonbb

According to the answer (same link above): Other people often suggest you create the resource with an empty POST, then, once the client has the id of the newly created resource, he can do an "idempotent" update to fill it. This is nice, but you will likely need to make DB columns nullable that wouldn't otherwise be, and your updates are **only** idempotent **if** no-one else is trying to update at the same time.

Also in the comments: I'm all for good style, but your solution includes an additional roundtrip just for conceptual soundness. And I'm actually very fond of the idea of non-centralized id's, which can be easily accomplished by using a random 128-bit UUID. Nevertheless, it surprises me that I can't seem to find an authoritative source that addresses this (very common - I'd say) problem. – wvdz

### Race condition (like in ticket reservation system)

https://stackoverflow.com/a/26175863/0.
Database level This is the preferred solution. You obtain the lock on the record in the database before you update. SQL provides an option for selecting the record for update.
SELECT \* FROM BUS_SEATS WHERE BUS_ID = 1 FOR UPDATE;
</br>

## session id

It is useless to encrypt it for cookie, see https://stackoverflow.com/questions/2840559/is-encrypting-session-id-or-other-authenticate-value-in-cookie-useful-at-all. But if the random number was not cryptographically secure, encrypting it with a server side key will produce better security. See AJ Henderson comment.

## signed cookies And HTTP

Good for time-limited-form-submission (anti-spam) without having to store any data on the server side.
https://stackoverflow.com/questions/3240246/signed-session-cookies-a-good-idea.

According to https://stackoverflow.com/a/3240427/0:
They should be kept private, so that attackers cannot steal them and impersonate an authenticated user. Any request that performs an action that requires authorization should be tamper-proof. That is, the entire request must have some kind of integrity protection such as an HMAC so that its contents can't be altered. For web applications, these requirements lead inexorably to HTTPS.
