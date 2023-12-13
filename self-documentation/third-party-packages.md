## Why Winston?

We could use another logging library called `pino`. But then we had to use another tool, like [logrotate](https://github.com/logrotate/logrotate) to rotate our logs. There is a package called `pino-rotating-file` but it has only 22 stars on github. Compare it to `winston-daily-rotate-file`` which has over 800 starts on github and two million weekly downloads on npm. So winston is chosen as our logging library.  

</br>


## `mysql2`

For return value of `query` and `execute` see [here] https://github.com/sidorares/node-mysql2/blob/master/documentation/en/TypeScript-Examples.md#type-specification.

## `type cast`

You can also specify a function (field: any, next: () => void) => {} to do the type casting yourself.
Also see Storing Boolean TINYINT in database.md.

## If you use raw sql query be careful of backticks vs single vs double quotation. See database.md.

## cuid2 vs nanoId vs UUID


https://dev.to/harshhhdev/uuidguid-cuid-nanoid-whats-the-difference-5dj1.
https://stackoverflow.com/questions/71977961/are-there-any-downsides-to-using-nanoid-for-primary-key.

From https://stackoverflow.com/questions/3804108/use-email-address-as-primary-key.
 And like phone numbers, emails can get re-used. Jsmith@somecompany.com can easily belong to John Smith one year and Julia Smith two years later.
+ many other reasons.

From https://stackoverflow.com/questions/6761403/how-to-get-the-next-auto-increment-id-in-mysql.
I didn't downvote it, but the problem with attempting to use the last auto incrementing value is that it might not be the last one by the time you come to use it - no matter how quickly the SELECT and subsequent INSERT is carried out.

</br>

## cuid and jest
See https://github.com/paralleldrive/cuid2#using-in-jest. Jest uses jsdom, which builds a global object which doesn't comply with current standards. There is a known issue in Jest when jsdom environment is used. The results of new TextEncoder().encode() and new Uint8Array() are different.

## Why sanitize-html over dompurify
Running DOMPurify on the server requires a DOM to be present. So we have to install jsdom which 3 MB. sanitize-html is enough. Recall, we must purify in server, since we are using template engines.


## SQL injection
Caution These methods of escaping values only works when the NO_BACKSLASH_ESCAPES SQL mode is disabled (which is the default state for MySQL servers). Based on  Yousaf comment in https://stackoverflow.com/questions/15778572/preventing-sql-injection-in-node-js.


## Faker 
There are a few methods which use relative dates for which setting a random seed is not sufficient to have reproducible results.  for example: faker.date.past. This is because these methods default to creating a date before or after "today", and "today" depends on when the code is run. See https://fakerjs.dev/guide/usage.html#reproducible-results.


## Joi
We use it. But be careful about email. Note, don't use regex for email verification. See https://stackoverflow.com/a/1373724 and https://mailoji.com/.


## Express response
https://expressjs.com/en/api.html#res.send.
The body parameter can be a Buffer object, a String, an object, Boolean, or an Array. But This method performs many useful tasks for simple non-streaming responses: For example, it automatically assigns the Content-Length HTTP response header field (unless previously defined) and provides automatic HEAD and HTTP cache freshness support.