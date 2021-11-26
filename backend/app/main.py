"""Generate the application.

Example:
    $ exec uvicorn --host=0.0.0.0 app.main:app

Todo:
    * Implement API specific settings
    * Configure appliation logging
"""

from app.api.routes import router
from fastapi import FastAPI


def get_application() -> FastAPI:
    """Get the application with all settings and routes.

    Returns: FastAPI object

    """
    application = FastAPI()

    application.include_router(router)

    return application


app = get_application()
