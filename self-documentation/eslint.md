## `.eslintrc.js` 

You can have multiple `.eslintrc.js` files (according to [Cascading and Hierarchy from docs](https://eslint.org/docs/latest/use/configure/configuration-files#cascading-and-hierarchy)). If you are using ES modules syntax is your subfolder (i.e. `package.json` contains `type: module`), then your eslint config file **must** end in `.cjs` (See [configuation file formats in docs](https://eslint.org/docs/latest/use/configure/configuration-files#configuration-file-formats)). Anyway, you can check whether your config file is correct or not, by using eslint CLI interface in your subfolder (e.g. add `"lint": "eslint <some-file>"` in package.json of the subfolder and then execute `lint` script). Even if your config is not correct, vscode extension will still work but ignores your `eslintrc` configs. 

We also install `eslint` npm package in the root. So VSCode will use exact same package as installed. See [here](https://stackoverflow.com/questions/68721073/what-is-the-difference-between-installing-eslint-as-extension-and-installing-as) to learn about benefits of installing eslint locally. Also do not forget to install eslint extension for vscode. ESLint as an npm package does not provide any editor integration, only the CLI executable.

</br>


## Why not Prettier?

Prettier is an *opnionated* code formatter, meaning we cannot customize it as we like. Some of format styles that are forced by prettier, emotionally hurts me. So we decided not to use prettier. It is fairly ok, because this repo is maintained by a single contributor.

<br/>