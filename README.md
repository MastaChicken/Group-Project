# Content Visualisation

This project is divided into two components: frontend (client) and backend (server)

[[_TOC_]]

## Quick start

For the backend, you can either use the [docker-compose](#docker) or [install](#source) 
using the Python's distribution format, `wheels`.

However, the frontend currently doesn't require any external dependencies for production
For development, see [frontend](frontend/README.md)

You should be able to launch the [homepage](frontend/index.html) directly

Once you have the server running, the application is ready to use!

### Docker

This is the easiest method of running the server

#### Requirements

- `docker` >= 20.10
- `docker-compose` >= 1.29

#### Running

```bash
$ docker-compose up
```

This will run the API server in production mode using `gunicorn` on
`http://localhost:8000` and the web app in development mode on `http://localhost:3000`

### Source

Despite the frontend and backend using interpreted languages, it is possible to
build the backend into a distribution format, known as `wheels`.

#### Requirements

- `python` >= 3.10
- `poetry` >= 1.1.12 (optional)

#### Building

```bash
$ poetry build
```

This will build the source and wheels archive (run this command in the backend folder)

#### Release

You can instead download the `whl` file from the release section

```bash
$ pip install *.whl
```

This will automatically install the dependencies and the backend files as `app`

```bash
$ pip install --target=. *.whl
```

This will also install the dependencies but in the current directory

#### Running

```bash
$ python debug_server.py
```

This will run the server in debug mode

## Development guides 

- [General](DEVELOPMENT.md)
- [Backend](backend/README.md)
- [Frontend](frontend/README.md)

