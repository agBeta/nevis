## Why not jest?

Node test runner is native to node. Jest has so many polyfills to work also on the browser. So node:test should be faster in theory (an it is). Also the code is more maintainable since we do not rely on a third-party package.

Also for cuid Jest uses jsdom, which builds a global object which doesn't comply with current standards. See https://github.com/paralleldrive/cuid2#using-in-jest.

</br>

## Integration
Bill Souror accesses db in integration/e2e test. See https://github.com/dev-mastery/comments-api/blob/master/__test__/e2e.spec.js#L34.

## Fixtures
Fixtures for unit tests is different from fixtures for integration and e2e test.

## Test doesn't finished

The problem was setInterval inside our codeDb. But in case you really need to have some setInterval inside you code and want to clean them up, you can see https://stackoverflow.com/questions/8635502/how-do-i-clear-all-intervals. **Note** that based on the spec [https://html.spec.whatwg.org/#timers] does **not** guarantee any specific order for the handles, only that they are numeric and unique. Also **note** that returned ids are from same pool for setTimeout and setInterval (see https://stackoverflow.com/questions/9913719/are-cleartimeout-and-clearinterval-the-same.).


The same problem can also happen if you forget to close db connection( see https://github.com/ladjs/supertest/issues/437#issuecomment-353277424 ).

Do not use --exit flag or similar. Based on comment by  reads0520 in https://stackoverflow.com/questions/50372866/mocha-not-exiting-after-test
 This default behavior can be really helpful, and I wouldn't recommend forcing your tests to exit. Usually when mocha hangs and won't exit, there is something in your code that needs to be cleaned up. It's better to find the problem. I've found a lot of potential leaks this way.

Also checkout https://github.com/mafintosh/why-is-node-running.

Sometimes the test does not finished because of unclosed http connections or sockets. You may need to change socket timeout in server default config. See https://stackoverflow.com/questions/12651466/how-to-set-the-http-keep-alive-timeout-in-a-nodejs-server.
Also read Joshua wise and Golo Roden answers here https://stackoverflow.com/a/31504868.
Connection timeout and keep-alive manifest iteself even in some packages, slowing down the test. See for example this jsdom issue (https://github.com/jsdom/jsdom/issues/2176). You can disable keep alive in express.static easily. It is described there.

## Node test runner  

### Running tests from the CLI
See [this part](https://nodejs.org/docs/latest/api/test.html#running-tests-from-the-command-line) of official docs. You can also filter tests by name (not filename). See [filtering tests](https://nodejs.org/docs/latest/api/test.html#filtering-tests-by-name) from docs.  

### How tests are processed?
Although it might sound trivial but it is fundamental. Remember, tests pass if they don't fail. Tests created via the test module consist of a single function that is processed in one of three ways. Read the first lines from [official docs](https://nodejs.org/docs/latest/api/test.html#test-runner).

