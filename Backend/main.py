from fastapi import FastAPI
from api.database.db import init_db
from api.router import api_router
from core.config import settings
init_db()


app = FastAPI()
app.include_router(api_router, prefix=settings.API_PREFIX)

@app.get("/health")
def health():
    return{"status": "Server Healthy."}
