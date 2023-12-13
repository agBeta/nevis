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
First generator is something specific in world of programmign (i.e. yield).
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