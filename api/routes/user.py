from fastapi import APIRouter, HTTPException, status, Depends
from api.database.schema import RegisterResponse, RegisterUser, Login
from api.database.models.models import Registration
from api.database.db import get_db
from sqlmodel import Session, select
from api.utils.utils import hashed_password, verify_password
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
    # await sendmail(new_user.email, new_user.firstname)
    db.refresh(store_user)
    return store_user




@router.get("/login", status_code=status.HTTP_200_OK)
async def login(user: Login, db: Session = Depends(get_db)):
    email = user.email
    check_email = db.exec(select(Registration).where(Registration.email == email)).first()
    

    # user = 

    if not check_email:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Incorrect details")

    password = user.password
    print(password)
    check_password = db.exec(select(Registration.password)).fetchall()
    print(check_password)
    # password_match = verify_password(password)

    # if not password_match:
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Incorrect details") check

    return {
        "message": "login success!!!"
    }