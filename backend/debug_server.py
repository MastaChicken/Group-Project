"""Run the server in debug mode.

app object is located in `app/main.py`
"""
import uvicorn
from app.main import app  # noqa: F401

if __name__ == "__main__":
    uvicorn.run("debug_server:app", host="0.0.0.0", port=8000, reload=True)
