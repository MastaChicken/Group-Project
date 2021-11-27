# vim: ft=dockerfile
FROM python:3.10-slim as base

# Python settings
ENV PYTHONFAULTHANDLER=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONHASHSEED=random \
    PYTHONUNBUFFERED=1

WORKDIR /app

FROM base as builder

# PIP settings
ENV PIP_DEFAULT_TIMEOUT=100 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    POETRY_VERSION=1.1.11

# Install poetry
RUN pip install "poetry==$POETRY_VERSION"

# Install packages
RUN python -m venv /venv
COPY pyproject.toml poetry.lock ./
RUN . /venv/bin/activate \
    && poetry install --no-dev --no-root --no-interaction

COPY . .
RUN poetry build \
    && /venv/bin/pip install dist/*.whl

FROM base as final

COPY --from=builder /venv /venv
COPY docker-entrypoint.sh ./
CMD ["./docker-entrypoint.sh"]
