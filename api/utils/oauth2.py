import jwt
from jwt.exceptions import InvalidTokenError
from datetime import datetime, timedelta, timezone
from api.database.schema import TokenData
from fastapi.security.oauth2 import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from dotenv import load_dotenv
import os
load_dotenv()

oauth2_schema = OAuth2PasswordBearer(tokenUrl='login')

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRY_TIME = int(os.getenv("ACCESS_TOKEN_EXPIRY_TIME"))


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRY_TIME)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str, credentials_exception):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        id: int = payload.get("id")

        if id is None:
            raise credentials_exception
        token_data = TokenData(id=id)
        new_token_data = token_data.id
    except InvalidTokenError:
        raise credentials_exception
    return new_token_data


def get_current_user(token: str = Depends(oauth2_schema)):
    credential_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    return verify_token(token, credential_exception)