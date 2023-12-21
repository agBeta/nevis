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

## 422 for path invalid (especially invalid actionId)  

422 was web-dav, but now is in standard http spec. See https://www.rfc-editor.org/rfc/rfc9110#name-422-unprocessable-content.
It seems semantically the best choice for invalid path params when body is ok. Look what it says: "Unprocessable Content". It is self-explanatory. 
According to this answer https://stackoverflow.com/questions/44915255/is-it-ok-return-http-status-404-in-the-post, it is BAD idea to return 404 in such situations (i.e. when path params are not valid). But it is ok to send 400. 

Also more about why 422 is better than 400, see "leo_cape" comment and " 
Philippe Gioseffi" comment below [this SO answer](https://stackoverflow.com/a/52363900/22969951).

According to https://stackoverflow.com/a/21488282, The most important thing is that you:
- Use the response code(s) consistently.
- Include as much additional information in the response body as you can to help the developer(s) using your API figure out what's going on.

## Don't use 1xx responses
https://stackoverflow.com/a/51255297.

</br>

## Exposing userId and postId
It seems ok. It is not data security risk. But might be business intelligence security risk. See https://stackoverflow.com/a/32144572.

Exposing hashed ids for data security is complete pointless. See https://stackoverflow.com/a/32144572/. Unless you encrypt or hash your ids Using session id as a salt. But is an over-kill and also creates its own problems. See https://stackoverflow.com/a/10036069.


</br>

## Fundamentals

### Cache
Cacheable methods and status codes: [MDN Cacheable](https://developer.mozilla.org/en-US/docs/Glossary/Cacheable).

Also https://jakearchibald.com/2016/caching-best-practices/.
Note that you can purge cache on Cloudflare, but it could still be cached elsewhere between client and server, e.g. by your ISP or the end-user's ISP. ---> Archibald's answer: Not, since I serve over HTTPS.

A very good detailed answer on GET cache (and also when it isn't idempotent). https://stackoverflow.com/a/65038716. Also read comment by  
tmdesigned. Quoting from answer:
... Deviating from them sets yourself up for failure in many ways. (For instance, there are different security expectations for requests based on method. A browser may treat a GET request as "simple" from a CORS perspective, while it would never treat a PATCH request as such.).


According to https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching:
However, in recent years, as HTTPS has become more common and client/server communication has become encrypted, proxy caches in the path can only tunnel a response and can't behave as a cache, in many cases. So in that scenario, there is no need to worry about outdated proxy cache implementations that cannot even see the response.
Also read about private cache in the same article. Don't blindly use public,max-age=... .

Also read about Managed caches: For example, the following `Cache-Control: no-store` can be specified to opt-out of a private cache or proxy cache, while using your own strategy to cache only in a managed cache. 

Also about [Heuristic caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#heuristic_caching), Quoting:
... even if no Cache-Control is given, responses will get stored and reused if certain conditions are met.
How long to reuse is up to the implementation (i.e. browser), but the specification recommends about 10% (in this case 0.1 year) of the time after storing.

Expires or max-age --> As summary, use max-age.

https://stackoverflow.com/questions/58428814/should-i-add-cache-control-no-cache-to-get-endpoints-of-my-rest-api.

</br>

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
https://stackoverflow.com/a/35429135/.
Also comment by bbsimonbb (author of article above): "Awfully" is a bit strong ! Responses will be tiny, a fraction of a kilobyte. If you had huge volumes, you could use an ACID key value store (couchDB?) just for storing respones. The payments web-service where I first used this pattern has been ticking away happily for 15 years atop a SQL Server DB. It's so simple to develop, to integrate with and to support that I find myself agog at the other answers to this problem. You can't not have noticed: Among all the RESTful discussion of how you should deal with this, no-one talks about their experience, their problems, their volumes. – bbsimonbb

Also another answer (from the same person) in another post: https://stackoverflow.com/a/35453041.
I say that I prefer server generated ids because it increases the likelihood of clients behaving responsibly. There are no guarantees, but the developers calling your api want to "do the right thing" just as much as you do, as a general rule. With this pattern, unambiguous interaction is at least possible. Directly addressing unsafe requests to "real" resources has led us into a world of pain and kludges. 


According to the answer (same link above): Other people often suggest you create the resource with an empty POST, then, once the client has the id of the newly created resource, he can do an "idempotent" update to fill it. This is nice, but you will likely need to make DB columns nullable that wouldn't otherwise be, and your updates are **only** idempotent **if** no-one else is trying to update at the same time.

Also in the comments: I'm all for good style, but your solution includes an additional roundtrip just for conceptual soundness. And I'm actually very fond of the idea of non-centralized id's, which can be easily accomplished by using a random 128-bit UUID. Nevertheless, it surprises me that I can't seem to find an authoritative source that addresses this (very common - I'd say) problem. – wvdz

Extra (added by yourself): We are sacrificing one round-trip just to generate an actionId, whereas we could do that in client-side.
But it is ok, for two reasons:
First: How many POST,PUT,PATCH requests does a particular client makes comparing to GET requests? Meaning, we only use this for PUT, POST and PATCH requests that need idempotency. But these requests make up only a small portion of all requests that a client will send. So there is no significant slow-down in client. Second: explained as comment in @version in `action.js` file.


### Race condition (like in ticket reservation system)

https://stackoverflow.com/a/26175863.
Database level This is the preferred solution. You obtain the lock on the record in the database before you update. SQL provides an option for selecting the record for update.
SELECT \* FROM BUS_SEATS WHERE BUS_ID = 1 FOR UPDATE;

Also there is an interesting trick (although probably not quite practical in most cases), session lock. (Only possible with single process) Enabling sessions and using session will cause implicit locking between requests from the same user (session). Session["TRIGGER_LOCKING"] = true;  
But it seems this trick can be used if we have layer 4 load balancer.

</br>

## session id

It is useless to encrypt it for cookie, see https://stackoverflow.com/questions/2840559/is-encrypting-session-id-or-other-authenticate-value-in-cookie-useful-at-all. But if the random number was not cryptographically secure, encrypting it with a server side key will produce better security. See AJ Henderson comment.

## signed cookies And HTTP

Good for time-limited-form-submission (anti-spam) without having to store any data on the server side.
https://stackoverflow.com/questions/3240246/signed-session-cookies-a-good-idea.

According to https://stackoverflow.com/a/3240427:
They should be kept private, so that attackers cannot steal them and impersonate an authenticated user. Any request that performs an action that requires authorization should be tamper-proof. That is, the entire request must have some kind of integrity protection such as an HMAC so that its contents can't be altered. For web applications, these requirements lead inexorably to HTTPS.

</br>

## important thing about REST
Let's give you the answer right now: We don't care. We made some ad-hoc decisions. 
**BUT...** It is important to be aware of trade-offs, and hidden costs behind these decision.

Imagine /posts?page=1 (ignore bad pagination style for now). Imagine each post has authorId (i.e. userId). To prevent N+1 problem it is usually recommended to attach name and avatar picture of authorId directly to the post. This [youtube video](https://www.youtube.com/watch?v=JxeTegu4dD8) the presenter recommends the aforementioned optimizations to prevent N+1 problem. But regarding this ad-hoc decision, there a comment by @ugentu:
---start of comment---
Thanks for the great review of the main concepts! Sounds valuable as a base. 
But can't mention that "Optimisation" advice is completely out of REST principles. One of the REST principles is, roughly speaking, resource-per-URI. Violating it with such entities folding, you may achieve quick improvement, but with a big price to pay later.

I have at least three reasons not to go with folded entities:
1) Cache inconsistency: In your example, If any of the Users updates a name, you'll need to invalidate all Posts-related cache. It may look as not a big deal in this particular scenario, but if you expend this approach - you may come up with inconsistent caching all over your API because all entities are somehow relates\included to one another.
 
2) Inconsistency in approach: Let's imagine that the user has a dependency on "subscriptions". Should we include it as well? Should we include Subscription dependencies as well? Feels not too optimal, isn't it? So what are the limit levels to fold? You may say that it depends on the situation,  but it's actually not - it is just better not to include related entities in the response.

Some more examples are if the entity has many dependencies. What if we have Comments? Reactions? Should we fetch it and return it all the time?
What if your folded data is big? Imagine you are fetching 100 posts for one user, and all the posts will contain the same copy of User data.
What If another 10 other Clients don't care about Users of the Posts at all, but are served with a redundant chunk of payload? 

When you have no strict pattern - you'll need to make ad-hoc decisions for each case, which leads to a messy API shape, hard both to use and maintain. 
 
3) Data type inconsistency - a nightmare when you shape folded entities in different ways, based on the use case. 
Like, in the context of the posts we are interested in First Name + Last name + Avatar URL.
In the profile\admin  context, we want all the details, like phone, email, address, etc.
It means that at Client we have two "kinds" of User TS interface\type - full and limited. So, should we define them separately? Otherwise - generalize them, so make all the fields that may be absent in any of the two options - nullable? This means null-checks and cast issues all over the app. Again, seems not a big deal when we have only 2 "variants". But in reality - we easily can over-"optimize" to have really different shapes of the same entity, with different "folded" entities depending on the usage context, and things go crazy.

And final - it just violates the Dependencies Inversion and Interface Segregation principles of SOLID. In this way, you are making API know about how the Client uses that data, so API depends on the Client.

Sure, there are some scenarios when you may naturally want to include the folded items, because of really strict non-functional requirements.
But those are exclusions, and shouldn't be the default tip to follow. 

If you have such requirements - probably you want to consider:
1) Prefetching
2) BFF layer  - where you'll define client-specific API contracts, and will have a place to collect data from different sources and aggregate them in a client-friendly structure)
3) GraphQL - which is designed for such scenarios.
---end of comment---

From another comment: Optimizing REST services is challenging and depends heavily on how you're going to use them. Always including child records can be a bad practice.  

From another comment: ...You advice is effective for HTTP interactions but from a REST perspective is confusing / harmful. 
If minimizing HTTP calls is optimal for your use cases and you want to aggregate data across entities, look at something else, i.e. OData, GraphQL, etc.  



**But...** there is another comment which shows the other side of trade-off:
@sfulibarri
The biggest mistake any dev can make when building a REST API is spending hours and hours agonizing over if every little thing is 'RESTful' or not. Just get it working, you will understand more about the problem space as you work and be able to make better decisions. Trying to design for some extremely vague principals of 'RESTfulness' from the get go will only cause you pain and more often than not, unless you are building an explicitly public API, the only thing that matters is that your endpoints provide the needed functionality and behave according to the documentation. Most of the worst API's I have ever had to work with in my career were just clearly designed to be 'RESTful' for the sake of being 'RESTful' and it was a nightmare to use them. 



</br>

## Unknown aspects of scaling
These are **not** quite related to this project. But they open you eyes.
This comment by Kasey Speakman is great: https://dev.to/rhymes/what-would-you-use-as-a-sortable-globally-unique-id-5akb#comment-f6em.

Good SO answer: https://stackoverflow.com/a/47155318.

Sharding & IDs at Instagram: https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c.

