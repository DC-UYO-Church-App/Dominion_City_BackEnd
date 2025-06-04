from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from api.database.schema import RegisterResponse, RegisterUser, UserLogin
from api.database.models.models import Registration
from api.database.db import get_db
from sqlmodel import Session, select
from api.utils.utils import hashed_password, verify_password
from api.utils.oauth2 import create_access_token
from api.utils.emails import sendmail




router = APIRouter()


@router.post("/signup", status_code=status.HTTP_201_CREATED, response_model=RegisterResponse)
async def register(new_user: RegisterUser, db: Session = Depends(get_db)):
    email = new_user.email
    email_check = db.exec(select(Registration).where(Registration.email == email)).first()

    if email_check:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="user with this already exists")
    password = new_user.password
    if len(password) < 8:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="password shouldn't be less than 8 characters.")
    hasing_password = hashed_password(password)
    new_user.password = hasing_password

    store_user = Registration(**new_user.model_dump(exclude_none=True))
    db.add(store_user)
    db.commit()
    await sendmail(new_user.email, new_user.firstname)
    db.refresh(store_user)
    print(store_user.points)
    return store_user




@router.get("/login", status_code=status.HTTP_200_OK)
async def login(users: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.exec(select(Registration).where(Registration.email == users.username)).first()
    

    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Incorrect details")

    if not verify_password(users.password, user.password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid credentials.")

    access_token = create_access_token(data={"id": user.id})

    return {
        "access_token": access_token,
        "token_type": "Bearer"
    }