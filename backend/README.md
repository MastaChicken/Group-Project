# Backend

The backend is written in Python. If using Visual Studio Code, ensure you have the
[Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python)
extension installed for code completion. 


## Requirements

- Python >= 3.10
- Poetry >= 1.1.12

## Setup

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

## Testing

We use `pytest` to create and run unit tests.

### Create

Tests names should have the following format `tests/<package>/test_<module>.py`

[pytest API reference](https://docs.pytest.org/en/6.2.x/reference.html)

### Running

`$ poetry run pytest`

This will run all the tests in the `tests/` folder.

`$ poetry run pytest tests/<test_name>.py`

This will run a specific python test module.

### Coverage

We include a tool to measure the code coverage of the unit tests, `coverage.py`

```
$ poetry run coverage run -m pytest
$ poetry run coverage report
```

This will generate a `.coverage` file in the current directory, which is used to
generate a report printed to the console.

`$ poetry run coverage html`

This will generate a complete report located at `htmlcov/index.html`

## API

The API is written using [FastAPI](https://fastapi.tiangolo.com/)

### Debug

Run the server in debug mode:
```
$ python debug_server.py
```

Debug mode runs on `localhost:8000` and enables hot-reloading (allows you to
make changes without having to restart the server)

## Documentation

### Docstrings

We follow the Google Python docstring style convention. `pydocstyle` is a dev
dependency that has been setup to check compliance. The Python linter, `flake8`,
should warn you when compliance has not been met.

> https://google.github.io/styleguide/pyguide.html#38-comments-and-docstrings

### Building

You need to be in the virtual environment and/or have `sphinx` installed.
```
$ sphinx-apidoc -o docs/ app/
$ sphinx-apidoc -o docs/ tests/
$ cd docs && make html
```

This will build the html files in `docs/_build/html`

For more commands, run `make help` in the `docs/` directory

## Code style

We follow the Google Python style guide for writing Python.

> https://google.github.io/styleguide/pyguide.html

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

