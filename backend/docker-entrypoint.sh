#!/bin/sh

set -e

. /venv/bin/activate

# Debug
# exec uvicorn --host=0.0.0.0 app.main:app

# Production
exec gunicorn --preload --worker-class=uvicorn.workers.UvicornWorker app.main:app
