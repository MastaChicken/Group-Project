# Frontend

The frontend is written in HTML, (S)CSS and a mix of JavaScript and TypeScript
(ES6 Modules). Refer to [Code Style](#code-style) guide for more information.

[[_TOC_]]

## Requirements

-   `Node.js` >= 16

## Setup

Once Node is installed, it should also include the `npm` binary.

`$ npm install`

This should install all the dependencies listed in the `package.json` file,
including the TypeScript compiler.

The `src` folder is where the CSS, JS and TS is stored.

Using TypeScript for writing modules is preferred due to its type checker, however,
using JavaScript is also acceptable.

## Serve

We use the `Vite` build tool for development and bundling.

[Vite guide](https://vitejs.dev/guide/)

### CLI

> Run the development server

`$ npm run dev`

By default, the server runs on [http://localhost:3000](http://localhost:3000).

If port 3000 is unaviable, the next free port will be used.

The development server will run ESLint and compile TypeScript files on file
change.

### VSCode

Install the [VSCode](https://marketplace.visualstudio.com/items?itemName=antfu.vite) extension.

VSCode should automatically start the dev server when you open the project.

## Testing

We use `playwright` to create and run end-to-end tests.

### Create

Test names should have the following format `e2e/<name>.spec.js`

Tests can also be written in typescript if preferred, however, they must be
written as [ECMAScript modules](https://nodejs.org/docs/latest/api/esm.html).

[Playwright Test API reference](https://playwright.dev/docs/api/class-test)

### Running

> If this is the first time, Playwright will prompt you to install the required dependencies

`$ npm run e2e`

This will run all the tests in the `e2e/` folder on Chromium and Firefox.

`$ npx playwright test <filepath>`

This will run a specific test on Chromium and Firefox.

## Documentation

Visual Studio Code should automatically generate [JSDoc](https://code.visualstudio.com/docs/languages/javascript#_jsdoc-support) comments in JavaScript files.

### Building

We use `typedoc` to generate documentation. `typedoc` is installed as a developer
dependency through `npm`

`$ npm run doc`

This will build the documentation in `docs/`

## Bundling

### CLI

> Build for production

`$ npm run build:prod`

This will create a folder, `dist/`, which will contain the files needed for
production

> Build for development

`$ npm run build:dev`

> Locally preview the production build (live server)

`$ npm run preview:prod`

> Locally preview the dev build (live server)

`$ npm run preview:dev`

By default, the server runs on [http://localhost:4173](http://localhost:4173).

## Code style

We aim to follow the latest JavaScript Standard, ES12 (2021).
We follow Google's HTML/CSS, JavaScript and TypeScript style guides.

> <https://google.github.io/styleguide/htmlcssguide.html>

> <https://google.github.io/styleguide/jsguide.html>

> <https://google.github.io/styleguide/tsguide.html>

### ES6 Modules

Similar to classes in OOP languages, we can use the [Module design pattern](https://coryrylan.com/blog/javascript-module-pattern-basics) to
ensure a maintainable codebase.

Modules allow us to use the `import` and `export` statements.

In the relevant module (views), ensure that you use [addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
instead of polluting the global namespace (exporting to window) when you want to
add an interaction for HTMLElement using Javascript.

To create a module, create a Javascript file in the `src/modules/` folder. Make
sure to `export` any functions/classes/variables you want to use in other
Javascript modules.

In order to use your module externally, add an `import` statement at the top of
a given module.

> Example

`import MyClass from './MyModule.js';`

[Guide on modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

### Tailwind CSS

We use [Tailwind CSS](https://tailwindcss.com/) to make styling of the web app
effortless. If using Visual Studio Code, you should install the [Tailwind CSS
IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) to enhance the development experience.

### Web Components

We make use of [Shoelace](https://shoelace.style/) for
components that we require in the web app.

> Example usage (button)
> <https://shoelace.style/components/button>

1. Copy the bundler command from the "Importing" section, <https://shoelace.style/components/button?id=importing>
2. Add `import "@shoelace-style/shoelace/dist/components/button/button.js";` to top of `src/index.ts` file
3. You can use the `<sl-button></sl-button>` HTML tags now.

Check the component documentation for all available tags.

### ESLint

We use [ESLint](https://eslint.org/) as our code linter. If using Visual Studio
Code, you should install the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension.
Additional ESLint rules for JSDoc are also included.

#### CLI

To run ESLint manually, navigate to the root of the project `frontend/` and run

`$ npm run lint`

### Prettier

We use [Prettier](https://prettier.io/) as our code formatter. If using Visual Studio Code, you should
install the [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension.

#### CLI

To run Prettier manually, navigate to the root of the project `frontend` and run

`$ npm run format_lint`

This will check any files need formatting.

In order to format the files, inplace (this will modify the files!)

`$ npx prettier src --write`
