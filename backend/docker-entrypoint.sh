#!/bin/sh

set -e

. /venv/bin/activate

exec uvicorn --host=0.0.0.0 app.main:app
