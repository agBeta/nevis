## install
`npm init playwright@latest` --> said no `n` to browser and system deps.
You can can install them manually for only one browser (according to [docs](https://playwright.dev/docs/browsers#install-system-dependencies)) using `npx playwright install --with-deps chromium`. **BUT...** you can use current installed version of chrome, see [this SO answer](https://stackoverflow.com/a/71187812).


## test utils
Inspired by youtube video "Playwright Crash Course" from "Nx - Smart Monorepos" channel.
There's specially a part which uses `exec` from `child_process` in node to run a bash command (on minute 24). Maybe we can use the same approach to spin up a docker container for redis, MySQL, or run docker-compose.