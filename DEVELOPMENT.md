# Development

During sprints, we will work on branches derived from the `develop` branch. At
the end of the sprint the `develop` branch will be merged into `main`.

## Commit style guide

It is important to follow a few commit message conventions to ensure a uniform
commit history.


1.  Separate subject from body with a blank line
2.  Limit the subject line to 50 characters
3.  Capitalize the subject line
4.  Do not end the subject line with a period
5.  Use the imperative mood in the subject line
6.  Wrap the body at 72 characters
7.  Use the body to explain what and why vs. how

> https://chris.beams.io/posts/git-commit/

A git hook can be enabled to ensure that your commit messages are formatted
according to the conventions listed above. (Windows users need to use git bash)

```
$ git config --local core.hooksPath .githooks
```

## Merge requests

We have a development pipeline setup that will run after every commit. The
pipeline will check for common errors (static analysis) and formatting. If the
pipeline fails, you can check the pipeline logs and use that to fix the issue.
The issue usually should be related to linter errors or formatting errors,
however, if it fails otherwise, please notify the maintainer. Once the issue is
fixed locally, amend the commit that caused the pipeline failure. If the changes
are spread over multiple commits, create a new commit.

## Code editor

We recommend using Visual Studio Code for development. Referenced plugins may be
only available in the Visual Studio marketplace.

## EditorConfig

We include a `.editorconfig` file which allows us to maintain consistent coding
styles. To use EditorConfig, you will need to install the [plugin](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig).

## Docker

We use [docker](https://www.docker.com/) for building, testing and deploying the
application. As we will have multiple docker images, we will use
[docker-compose](https://github.com/docker/compose) to run the containers.

To create and start the app, run:
```
$ docker-compose up
```
## Frontend

The frontend is written in HTML, CSS and JavaScript. Development JavaScript
plugins require Node to be installed in your PATH. 
We follow Google's HTML/CSS and JavaScript style guides.

> https://google.github.io/styleguide/htmlcssguide.html

> https://google.github.io/styleguide/jsguide.html

### ESLint

We use [ESLint](https://eslint.org/) as our code linter. If using Visual Studio
Code, you should install the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension.

## Backend

The backend is written in Python, so make sure you have the Python 3.10 runtime
installed in your PATH. If using Visual Studio Code, ensure you have the
[Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python)
extension installed. We follow the Google Python style guide for writing Python.

> https://google.github.io/styleguide/pyguide.html

### Poetry 

We use [poetry](https://python-poetry.org/) for dependency management.

To get started, run:
```
$ poetry install
```

This will create a local Python virtual environment, `.venv`, which will contain
the production and development dependencies.

To use the virtual environment, change the interpreter environment to
`./.venv/bin/python3` in Visual Studio Code. If working on the CLI, source the
relevant script (related to the shell you are using).

Example using bash (\*nix):
```
$ source .venv/bin/activate
```

Example using git bash (Windows):
```
$ source .venv/Script/activate
```

Ensure you keep the `poetry.lock` file updated when adding/updating/removing
dependencies.

### Black 

We use [Black](https://github.com/psf/black) as our formatter. If using Visual
Studio Code, you can change the `provider.formatting.provider` setting to
`"black"`. Setting the formatter to apply on save is also recommended.

> https://code.visualstudio.com/docs/python/editing#_formatting

### isort

We use [isort](https://github.com/PyCQA/isort) as an import formatter. If using
Visual Studio Code, you need to assign a keyboard shortcut to the
`python.sortImports` command.

> https://code.visualstudio.com/docs/python/editing#_sort-imports

### Flake8

We use [Flake8](https://github.com/PyCQA/flake8) as our code linter. If using
Visual Studio Code, you need to enable Flake8 by setting
`python.linting.flake8Enabled` to true. As part of the dev dependencies are
Flake8 plugins that should be enabled automatically.

> https://code.visualstudio.com/docs/python/linting

### Docstrings

We follow the Google Python docstring style convention. `pydocstyle` is a dev
dependency that has been setup to check compliance. The Python linter, `flake8`,
should warn you when compliance has not been met.

> https://google.github.io/styleguide/pyguide.html#38-comments-and-docstrings
