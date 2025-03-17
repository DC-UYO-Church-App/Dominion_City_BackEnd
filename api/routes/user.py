from fastapi import APIRouter, HTTPException, status, Depends
from api.database.schema import RegisterResponse,RegisterUser
from api.database.db import get_db
from sqlmodel import Session, select
from utils.utils import hashed_password




router = APIRouter()


@router.post("/signup", status_code=status.HTTP_200_OK, response_model=RegisterResponse)
async def register(new_user: RegisterUser, db: Session = Depends(get_db)):
    email = new_user.email
    email_check = db.exec(select(RegisterUser).where(RegisterUser.email == email)).first()
    if email_check:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="user with this already exists")
    password = new_user.password
    if password.len() < 8:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="password shouldn't be less than 8 characters.")
    hasing_password = hashed_password(password)
    new_user.password = hasing_password

    store_user = RegisterUser(**new_user.model_dump(exclude_none=True))
    db.add(store_user)
    db.commit()
    