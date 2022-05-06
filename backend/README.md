# Backend

The backend is written in Python. If using Visual Studio Code, ensure you have the
[Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python)
extension installed for code completion.

[[_TOC_]]


## Requirements

-   `python` >= 3.10
-   `poetry` >= 1.1.12

## Setup

### Poetry

We use [poetry](https://python-poetry.org/) for dependency management.

To get started, run:

```bash
$ poetry install
```

Script above will create a local Python virtual environment, `.venv`, which will contain
the production and development dependencies.

To use the virtual environment, change the interpreter environment to
`./.venv/bin/python3` in Visual Studio Code. If working on the CLI, source the
relevant script (related to the shell you are using).

Example using bash (\*nix):

```bash
$ source .venv/bin/activate
```

Example using Git bash (Windows):

```bash
$ source .venv/Script/activate
```

Example using powershell:
```ps1
$ .\.venv\Scripts\activate.ps1
```

Ensure you stage the changes if the `poetry.lock` file is updated; when adding/updating/removing
dependencies.

### Environment

Since the backend makes use of various APIs like GROBID and Hugging Face's
inference API, you will need to setup the `.env` file.

Start by copying the `.env.example` file as a `.env` file.
```bash
$ cp .env.example .env
```

#### Variables

- `GROBID_API_URL` (required string)
    - Used for parsing the PDF
    - See [API Prerequisities](#prerequisites)
- `HUGGINGFACE_API_TOKEN` (optional string)
    - Defaults to "" (empty string)
    - Default won't compute a final summary (returns large summary)
    - User access token [documentation](https://huggingface.co/docs/hub/security#user-access-tokens)
- `GROBID_API_TIMEOUT` (optional integer)
    - Defaults to 15
    - Measured in seconds
    - Increase the default if you are recieving `503` status code due to timeout
- `HUGGINGFACE_API_TIMEOUT` (optional integer)
    - Defaults to 60
    - Measured in seconds
    - Increase the default if final summary isn't being computed

Delete any variables that you want to keep at the default.
You may run into type related errors if an enviroment variable is kept empty.

## API

The API is written using [FastAPI](https://fastapi.tiangolo.com/)

### Prerequisites

The GROBID REST API needs to be running for the PDF parser.

Either of the following options runs the GROBID REST API locally on port 8070:8070

1. Run (development)
```bash
$ docker pull lfoppiano/grobid:0.7.1 # required only on first launch
$ docker run -t --rm --init -p 8070:8070 lfoppiano/grobid:0.7.1
```

2. Run (production)
```bash
$ docker-compose up
```

You can also try using an external GROBID REST API (no guarantees are made for uptime)

`https://cloud.science-miner.com/grobid/api`

Our API does not set up a GROBID REST API URL by default.

If you haven't already, please refer to [Environment](#environment) setup.

If you followed the commands above, the `.env` file should look like below
```env
# .env
GROBID_API_URL=http://host.docker.internal:8070/api
```

If you want to use the external API, the `.env` file should like below
```env
# .env
GROBID_API_URL=https://cloud.science-miner.com/grobid/api
```

### Running

Debug mode:

```bash
$ python debug_server.py
```

Debug mode runs on `localhost:8000` and enables hot-reloading (allows you to
make changes without having to restart the server)

### Status codes

#### `/upload` route

| HTTP status codes | Reason |
|-------------------|--------|
| 200 | Successful operation |
| 400 | PDF could not be parsed into Article object |
| 415 | PDF could not be read |
| 500 | Internal server error, i.e. Article object couldn't be serialised |
| 503 | GROBID API returned an error or is down |


### `/validate_url` route

| HTTP status codes | Reason |
|-------------------|--------|
| 200 | Successful operation |
| 415 | Link isn't a PDF |
| 500 | Internal server error, i.e. URL is invalid |

## Testing

We use `pytest` to create and run unit tests.

### Create

Tests names should have the following format `tests/<package>/test_<module>.py`

[pytest API reference](https://docs.pytest.org/en/6.2.x/reference.html)

### Running

```bash
$ poetry run pytest
```

Script above will run all the tests in the `tests/` folder.

```bash
$ poetry run pytest tests/<test_name>.py
```

Script above will run a specific python test module.

If those commands don't work on Git Bash. Try a different terminal.

### Coverage

We include a tool to measure the code coverage of the unit tests, `coverage.py`

```bash
$ poetry run coverage run -m pytest
$ poetry run coverage report
```

Script above will generate a `.coverage` file in the current directory, which is used to
generate a report printed to the console.

```bash
$ poetry run coverage html
```

Script above will generate a complete report located at `htmlcov/index.html`

## Documentation

### Docstrings

We follow the Google Python docstring style convention. `pydocstyle` is a dev
dependency that has been setup to check compliance. The Python linter, `flake8`,
should warn you when compliance has not been met.

> <https://google.github.io/styleguide/pyguide.html#38-comments-and-docstrings>

### Building

You need to be in the virtual environment and/or have `sphinx` installed.

```bash
$ sphinx-apidoc -fo docs/ app/
$ sphinx-apidoc -fo docs/ tests/
$ cd docs && make html
```

Script above will build the html files in `docs/_build/html`

For more commands, run `make help` in the `docs/` directory

## Code style

We follow the Google Python style guide for writing Python.

> <https://google.github.io/styleguide/pyguide.html>

### Black

We use [Black](https://github.com/psf/black) as our formatter. If using Visual
Studio Code, you can change the `provider.formatting.provider` setting to
`"black"`. Setting the formatter to apply on save is also recommended.

> <https://code.visualstudio.com/docs/python/editing#_formatting>

### isort

We use [isort](https://github.com/PyCQA/isort) as an import formatter. If using
Visual Studio Code, you need to assign a keyboard shortcut to the
`python.sortImports` command.

> <https://code.visualstudio.com/docs/python/editing#_sort-imports>

### Flake8

We use [Flake8](https://github.com/PyCQA/flake8) as our code linter. If using
Visual Studio Code, you need to enable Flake8 by setting
`python.linting.flake8Enabled` to true. As part of the dev dependencies are
Flake8 plugins that should be enabled automatically.

> <https://code.visualstudio.com/docs/python/linting>
