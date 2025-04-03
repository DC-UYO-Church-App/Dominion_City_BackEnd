from fastapi import APIRouter, HTTPException,status
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from fastapi import Depends
from api.database.db import get_db
from sqlmodel import Session, select
from api.database.models.models import Registration
from api.utils.oauth2 import get_current_user




router = APIRouter()

@router.get("/points/{point}")
async def add_points( point: int,  db: Session = Depends(get_db), current_user: Registration = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    current_user.points += point
    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return{
        "message": "Points added successfully",
        "user_id": current_user.id,
        "total_points": current_user.points
    }
    



