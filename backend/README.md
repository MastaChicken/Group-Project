# Backend

## API

### Debug

Run the server in debug mode:
```
$ python debug_server.py
```

Debug mode runs on `localhost:8000` and enables hot-reloading (allows you to
make changes without having to restart the server)

## Documentation

### Building

You need to be in the virtual environment and/or have `sphinx` installed.
```
$ sphinx-apidoc -o docs/ app/
$ sphinx-apidoc -o docs/ tests/
$ cd docs && make html
```

This will build the html files in `docs/_build/html`

For more commands, run `make help` in the `docs/` directory
