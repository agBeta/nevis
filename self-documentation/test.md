## Why not jest?

Node test runner is native to node. Jest has so many polyfills to work also on the browser. So node:test should be faster in theory (an it is). Also the code is more maintainable since we do not rely on a third-party package.

Also for cuid Jest uses jsdom, which builds a global object which doesn't comply with current standards. See https://github.com/paralleldrive/cuid2#using-in-jest.

</br>

## Don't spin up server separately before integ test

You will not be able to mock then.
We used to spin up test server (via node or nodemon) separately and run `npm test` command in a separate terminal. But it will eventually grind to a halt, as the project gets more complex and you have to mock or run concurrently.

</br>

## Integration

Bill Souror accesses db in integration/e2e test. See https://github.com/dev-mastery/comments-api/blob/master/__test__/e2e.spec.js#L34.

We used to have DbFx (db queries as fixtures), but it turned out to be premature abstraction. Most of the time each test suite needs its own ad-hoc queries. Moreover...
We decided to use some of data-access exported functions in our tests. If anything fails because of some bug  inside data-access implementation, it is actually to our advantage (happened in 4b6348f). It also prevent rewriting lots of code (especially useful when database columns change).  Bill Souror also uses data-access.

</br>

## (Deprecated but informative) Why not use pretest?

Tried many ways. Spinning up the server in pretest seems to block the process and the process does not finish so that `npm test` could run.
At last, the best way is actually creating two separate processes in separate terminals. One spin-up the server using nodemon. Then run node test runner afterwards in another terminal session.

## setIntervals and Test doesn't finish

The problem was setInterval inside our codeDb. But in case you really need to have some setInterval inside you code and want to clean them up, you can see https://stackoverflow.com/questions/8635502/how-do-i-clear-all-intervals. **Note** that based on the spec [https://html.spec.whatwg.org/#timers] does **not** guarantee any specific order for the handles, only that they are numeric and unique. Also **note** that returned ids are from same pool for setTimeout and setInterval (see https://stackoverflow.com/questions/9913719/are-cleartimeout-and-clearinterval-the-same.).

The same problem can also happen if you forget to close db connection( see https://github.com/ladjs/supertest/issues/437#issuecomment-353277424 ).

Do not use --exit flag or similar. Based on comment by reads0520 in https://stackoverflow.com/questions/50372866/mocha-not-exiting-after-test
This default behavior can be really helpful, and I wouldn't recommend forcing your tests to exit. Usually when mocha hangs and won't exit, there is something in your code that needs to be cleaned up. It's better to find the problem. I've found a lot of potential leaks this way.

Also checkout https://github.com/mafintosh/why-is-node-running.

(deprecated for this project but informative)  
Sometimes the test does not finish because of unclosed http connections or sockets. You may need to change socket timeout in server default config. See https://stackoverflow.com/questions/12651466/how-to-set-the-http-keep-alive-timeout-in-a-nodejs-server.
Also read Joshua wise and Golo Roden answers here https://stackoverflow.com/a/31504868.
Connection timeout and keep-alive manifest iteself even in some packages, slowing down the test. See for example this jsdom issue (https://github.com/jsdom/jsdom/issues/2176). You can disable keep alive in express.static easily. It is described there.

</br>

## Node test runner

### Running tests from the CLI

See [this part](https://nodejs.org/docs/latest/api/test.html#running-tests-from-the-command-line) of official docs. You can also filter tests by name (not filename). See [filtering tests](https://nodejs.org/docs/latest/api/test.html#filtering-tests-by-name) from docs.

### Test runner execution model

**Very important** if you want to use concurrency. --test-concurrency flag
Read https://nodejs.org/api/test.html#test-runner-execution-model

### How tests are processed?

Although it might sound trivial but it is fundamental. Remember, tests pass if they don't fail. Tests created via the test module consist of a single function that is processed in one of three ways. Read the first lines from [official docs](https://nodejs.org/docs/latest/api/test.html#test-runner).

### Native Test runner downsides

-   Bad error log when assertion fails. You may use `spoke` package.
-   Not enough documentation, especially about setup / teardown.

</br>

## Test Timezone

https://stackoverflow.com/questions/16448754/how-to-use-a-custom-time-in-browser-to-test-for-client-vs-server-time-difference/16449343#16449343.
Unfortunately, JavaScript is only aware of the current time zone, as it is set by the operating system. There are no facilities to let the Date object use a different time zone in a particular context.

## Why setup inside `before` hook?

See https://stackoverflow.com/a/71851612. if the setup is asynchronous, you can't do it inside describe block. Although it is for jest.

## mocks and hoisting

We must be careful about mocks and imports. Unlike jest, in which it will take of mocks. See https://www.coolcomputerclub.com/posts/jest-hoist-await/. Also According to [jest docs](https://jestjs.io/docs/manual-mocks#using-with-es-module-imports): ... But often you need to instruct Jest to use a mock before modules use it. For this reason, Jest will automatically hoist jest.mock calls to the top of the module (before any imports) ...


## Mock import, default export
https://stackoverflow.com/questions/77348607/mock-default-export-function-with-inbuilt-node-test-runner.
Also See commit 48ea129 and its diff. The problem happened when we try to mock sendEmail. But we cannot import it from ./controllers/index.js, because then the module will be imported and all controllers code will be initialized (especially auth_code_POST) before we get the chance to mock sendEmail. So even if we mock sendEmail, authRouter will be using the not-mocked version of sendEmail.
https://github.com/nodejs/help/issues/4298. -> how to mock standalone imported functions.
https://github.com/nodejs/node/issues/42242