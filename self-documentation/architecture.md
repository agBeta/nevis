## Folder structure
dev mastery - eric wandel

## Architecture
dev mastery - eric wandel

## Why entities
There must be a way to safely interact with data before saving to db. But admit, data is simpler than object. See the talk.

## Why services

## why user-db is ok
First it is under data-access so the real semantic of data access is preserved.
Second, from POV of services, it is considered a db. Services and user cases do not care the underlyings of user-db. 

## why not -generator for id
First generator is something specific in world of programming (i.e. yield).
Second its job is not only generating, but also validating.


## why express-callback
To have a fairly independent code from a third-party framework like Express.

## similar ...

## why data-access instead of database
more conciousness. Better name. database is sql but repositories is a driver.


## Why repeating insert function for all data access?
Prevent coupling

## Verification service
We may have differnt verification services. One with email. One with SMS. one with Two factor auth. And we may decide to install each one on a separate controller.

## Why randomBytes over UUID for sessionId?
According to https://nodejs.org/api/crypto.html#cryptorandombytessize-callback, Generates cryptographically strong pseudorandom data.
See database.md uuid.


## Why Joi inside controller?
Want to see validation next to code. Less jump around and search fatigue. No overdoing of clean-architecture.
validation near eye.

## Why send-email must be injected to codeService and not implemented inside codeService itself?
We may have a email service that has priority (high importance) settings for code emails. Also the email service might be heavy and might contain some retry logic or batching or any similar un-intuitive implementation. So definitely don't write send-email inside codeService.


## 
No need to hash password until we want to save. Don't waste performance.
Also give user object to db so that it cannot fiddle to much with it.


## clean architecture

Comments in
https://www.youtube.com/watch?v=SxJPQ5qXisw
TheDraiken, 5 months ago
Having worked with this in large codebases I can say with confidence: it's nice in theory but awful in practice.
The devil is in the details and people will abuse "interactors" in every possible way. Soon you'll have one interactor calling 5 other interactors which in turn call other interactors and in the end all you have is a procedural nightmare.

Unless you're strict about everything under this architecture, it will surely make your code unnecessarily complex with very little benefit. Be very careful with this. 

^^^^^^^^^^^^^^

thigmotrope 1 year ago
I can't imagine trying to explain all these abstractions to junior devs and maintaining any kind of long term fidelity to it.   No doubt it would become an unmitigated mess.   And senior devs would just argue about it.   Of course not doing this results in an unmitigated mess as well so I don't know.  I guess I'd prefer my messes with fewer abstractions.


https://www.reddit.com/r/androiddev/comments/9o1w35/downsides_of_clean_architecture/
Most of the time we deal with data consumption, there is no complex business logic in there. It means you have many read models with few write models and many logics that we put on use cases are simple as a query on a repository. I mean you have a bunch of CRUD operations with some filtering in them and choosing between different data sources. So if you want to put every CRUD operation into a single use case, you will have many use cases. 