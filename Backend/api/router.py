from fastapi import APIRouter
from api.routes import points, user


api_router = APIRouter()
api_router.include_router(user.router, prefix="", tags=["Signup"])
api_router.include_router(points.router, prefix="", tags=["Daily Points"])

