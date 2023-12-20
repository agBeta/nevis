## Why Winston?

We could use another logging library called `pino`. But then we had to use another tool, like [logrotate](https://github.com/logrotate/logrotate) to rotate our logs. There is a package called `pino-rotating-file` but it has only 22 stars on github. Compare it to `winston-daily-rotate-file` which has over 800 starts on github and two million weekly downloads on npm. So winston is chosen as our logging library.

</br>

## `mysql2`

### query vs execute

For return value of `query` and `execute` see [here] https://github.com/sidorares/node-mysql2/blob/master/documentation/en/TypeScript-Examples.md#type-specification.

### `type cast`

You can also specify a function (field: any, next: () => void) => {} to do the type casting yourself.
Also see Storing Boolean TINYINT in database.md.

### mysql2 Named placeholders

https://github.com/sidorares/node-mysql2/blob/master/documentation/en/Extras.md#named-placeholders.
connection.execute('select :x + :y as z', { x: 1, y: 2 } ...)

Named placeholders are good for translation from js camel case to sql snake case convention.
Also it gives us room to write sql queries in a cleaner way since we have a lot of space. If we hard code them inside data-access logic code, it would make the logic code very long and untraceable.
Also it makes easier to keep track of all queries we are making to db, especially if dev team doesn't have access to db monitoring tools and reports.
In addition, For someone outside dev team, it would be easier for him to find and assess queries. He doesn't have to go thorough the whole codebase to find sql query strings.

### If you use raw sql query be careful of backticks vs single vs double quotation.

See database.md.

</br>

## cuid2

### cuid2 vs nanoId vs UUID

https://dev.to/harshhhdev/uuidguid-cuid-nanoid-whats-the-difference-5dj1.
https://stackoverflow.com/questions/71977961/are-there-any-downsides-to-using-nanoid-for-primary-key.

From https://stackoverflow.com/questions/3804108/use-email-address-as-primary-key.
And like phone numbers, emails can get re-used. Jsmith@somecompany.com can easily belong to John Smith one year and Julia Smith two years later.

-   many other reasons.

From https://stackoverflow.com/questions/6761403/how-to-get-the-next-auto-increment-id-in-mysql.
I didn't downvote it, but the problem with attempting to use the last auto incrementing value is that it might not be the last one by the time you come to use it - no matter how quickly the SELECT and subsequent INSERT is carried out.

### cuid and jest

See https://github.com/paralleldrive/cuid2#using-in-jest. Jest uses jsdom, which builds a global object which doesn't comply with current standards. There is a known issue in Jest when jsdom environment is used. The results of new TextEncoder().encode() and new Uint8Array() are different.

</br>

## Why sanitize-html over dompurify

Running DOMPurify on the server requires a DOM to be present. So we have to install jsdom which 3 MB. sanitize-html is enough. Recall, we must purify in server, since we are using template engines.

## SQL injection

Caution These methods of escaping values only works when the NO_BACKSLASH_ESCAPES SQL mode is disabled (which is the default state for MySQL servers). Based on Yousaf comment in https://stackoverflow.com/questions/15778572/preventing-sql-injection-in-node-js.

## Faker

There are a few methods which use relative dates for which setting a random seed is not sufficient to have reproducible results. for example: faker.date.past. This is because these methods default to creating a date before or after "today", and "today" depends on when the code is run. See https://fakerjs.dev/guide/usage.html#reproducible-results.

## Joi

We use it. But be careful about email. Note, don't use regex for email verification. See https://stackoverflow.com/a/1373724 and https://mailoji.com/.

## Express response

https://expressjs.com/en/api.html#res.send.
The body parameter can be a Buffer object, a String, an object, Boolean, or an Array. But This method performs many useful tasks for simple non-streaming responses: For example, it automatically assigns the Content-Length HTTP response header field (unless previously defined) and provides automatic HEAD and HTTP cache freshness support.

## routes at runtime

https://stackoverflow.com/questions/20857865/okay-to-add-a-route-to-node-js-express-while-listening.
The main gotcha is going to be that routes are evaluated in the order they were added, so routes added at runtime will have a lower precedence than routes added earlier. This may or may not matter, depending on your API design.

Although completely un-related but comment by Jacob gives a very good observation: https://stackoverflow.com/questions/24042697/node-js-routes-adding-route-handlers-to-an-already-instantiated-http-server:
Disclaimer: I'm no Node developer, so read the following with that in mind. There is a small time window for which the listener is missing (between removeListener and on). As load (traffic) increases the risk of a request hitting the server when a listener has been removed while its replacement hasn't yet been registered also increases

## dotenv and alternative

Alternatives are not dev ready yet. They don't traverse parent directories, don't support multiline values, etc. But just for information:

-   built-in env in nodejs:
    https://dev.to/dotenv/nodejs-2060-includes-built-in-support-for-env-files-50mh.
    https://github.com/nodejs/node/issues/49148.  

-   using bash `source`:
    https://stackoverflow.com/a/19530367/0. source (or simply, .) is a built-in command in Unix shells (Bash, etc.) to read and execute commands from the given file, in the current shell.
