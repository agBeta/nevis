## `__dirname` vs `cwd`

`__dirname` is not the process directory path, it is the path of the current module's directory. So we use `process.cwd()` in our files router. For for information, see these links: [nodejs docs](https://nodejs.org/docs/latest/api/modules.html#__dirname) and this [stackoverflow answer](https://stackoverflow.com/a/16730379). `__dirname` is preferable for some reasons.  
There seems to be some gotchas regarding how to obtain value of `__dirname` so that is will be correct both in Windows and Linux. You can read this [stackoverflow question](https://stackoverflow.com/questions/46745014/alternative-for-dirname-in-node-js-when-using-es6-modules). We are deploying our code on a linux server so we don't care so much.

## `path.resolve` vs `path.join`

The name of `resolve` is not the most clear. You can think of `resolve` as `path.cd([starting dir], [final dir])`, would be much more intuitive. See this [link](https://stackoverflow.com/questions/35048686/whats-the-difference-between-path-resolve-and-path-join).

## Path alias

https://nodejs.org/api/packages.html#subpath-imports.
https://stackoverflow.com/questions/33214780/how-to-have-path-alias-in-nodejs.
https://github.com/johvin/eslint-import-resolver-alias.

Important note: make sure you set path alias also in jsconfig.json. See [typescript docs](https://www.typescriptlang.org/tsconfig#paths). Otherwise typescript language server will not display related erorrs and you will not be noticed.

## native fetch caveats

According to [stackoverflow](https://stackoverflow.com/questions/73817412/why-is-the-agent-option-not-available-in-node-native-fetch), fetch()'s HTTP stack (it uses a parallel, from-scratch HTTP stack rewrite called undici.) is entirely separate from the standard HTTP stack, it should not be surprising that the options you can supply to http.get et al don't work with fetch().
See also https://www.npmjs.com/package/node-fetch#custom-agent.
But we don't need agent options like Support self-signed certificate, only IPv4 or IPv6 or Custom DNS Lookup. So we use native fetch.

## strict mode

Module code is always strict mode code. But in comments says it is not exactly true. See https://stackoverflow.com/a/18417571.

## change env variables

https://stackoverflow.com/questions/59971381/change-env-variables-at-runtime.

## hoisted imports and env variables

Imports are hoisted, so your dotenv.config isn't being called until after the rest of your imports. According to https://stackoverflow.com/questions/74905685/environment-variables-only-working-when-dotenv-is-imported-and-configured-in-eac.
A _much better_ and comprehensive answer is here https://stackoverflow.com/a/42817956.
Javascript imports are hoisted (but not Typescript!), so imported modules will initialize before any of the current modules initialization code gets to run. Fortunately imported modules are initialized in order, so a possible workaround is putting the config code in its own module.

## camel case vs snake case

https://stackoverflow.com/a/21511149. Based on donut comment, Apparently, snake_case is easier to read.


## console.log memory leak and stringify
https://stackoverflow.com/questions/12996129/memory-leak-when-logging-complex-objects.