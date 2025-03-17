from fastapi import APIRouter
from api.routes import user


api_router = APIRouter()
api_router.include_router(user.router, prefix="", tags=["Signup"])

