"""Generate the application.

Example:
    $ exec uvicorn --host=0.0.0.0 app.main:app

Todo:
    * Implement API specific settings
    * Configure appliation logging
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router


def get_application() -> FastAPI:
    """Get the application with all settings and routes.

    Returns: FastAPI object

    """
    application = FastAPI()

    application.add_middleware(
        CORSMiddleware,
        # TODO: specify origins based on dev/prod
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(router)

    return application


app = get_application()
