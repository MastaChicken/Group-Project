# Frontend

The frontend is written in HTML, CSS and JavaScript.


## Requirements

- Node.js >= 16

## Setup

Once Node is installed, it should also include the `npm` binary.

`$ npm install`

This should install all the dependencies listed in the `package.json` file.

## Testing

We use `playwright` to create and run end-to-end tests.

### Create

Test names should have the following format `tests/<name>.spec.js`

Tests can also be written in typescript if preferred, however, they must be
written as [ECMAScript modules](https://nodejs.org/docs/latest/api/esm.html).

[Playwright Test API reference](https://playwright.dev/docs/api/class-test)

### Running

`$ npm run test`

This will run all the tests in the `tests/` folder on Chromium and Firefox.

`$ npx playwright test <filepath>`

This will run a specific test on Chromium and Firefox.

## Documentation

Visual Studio Code should automatically generate [JSDoc](https://code.visualstudio.com/docs/languages/javascript#_jsdoc-support) comments in JavaScript files.

### Building

We use `JSDoc` to generate documentation. `JSDoc` is installed as a developer
dependency through `npm`

`$ npm run doc`

This will build the documentation in `docs/`

## Code style

We aim to follow the latest JavaScript Standard, ES12.
We follow Google's HTML/CSS and JavaScript style guides.

> https://google.github.io/styleguide/htmlcssguide.html

> https://google.github.io/styleguide/jsguide.html

### ESLint

We use [ESLint](https://eslint.org/) as our code linter. If using Visual Studio
Code, you should install the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension.
Additional ESLint rules for JSDoc are also included.

### Prettier

We use [Prettier](https://prettier.io/) as our code formatter. If using Visual Studio Code, you should
install the [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension.
