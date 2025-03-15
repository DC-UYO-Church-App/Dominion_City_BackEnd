from fastapi import APIRouter




router = APIRouter()


@router.post("/signup")
async def register():
    pass