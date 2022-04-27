# Content Visualisation

This project is divided into two components: frontend (client) and backend (server)

[[_TOC_]]

## Quick start

In order to run the app, you need build the frontend and backend.

You will need to setup the `.env` file in the backend folder. For instructions on how
to do so, refer to [Environment setup](./backend/README.md#environment)

By default, the backend API server will run on `http://localhost:8000` and the
web app will run on `http://localhost:4173`.

### Docker

This is the easiest method of running the web application (backend and frontend)

#### Requirements

- `docker` >= 20.10
- `docker-compose` >= 1.29

#### Running

```bash
$ docker-compose up
```

### Source

This method builds the backend into a Python distribution format, known as `wheels`

#### Requirements

- `python` >= 3.10
- `poetry` >= 1.1.12
- `Node.js` >= 16 

#### Building

> Backend

```bash
$ cd backend
$ poetry build
```

This will build the source and wheels archive

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

This will run the backend API server in debug mode

> Frontend

```bash
$ cd frontend
$ npm run serve:dev
```

This will run the frontend using the development environment

## Development guides 

- [General](DEVELOPMENT.md)
- [Backend](backend/README.md)
- [Frontend](frontend/README.md)

