from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class RegisterUser(BaseModel):
    firstname: str
    lastname: str
    email: EmailStr
    phone_number: str
    password: str

    class Config:
        from_attributes = True


class RegisterResponse(BaseModel):
    firstname: str
    lastname: str
    email: EmailStr
    phone_number: str
    points: Optional[int] = Field(default=0)

    class Config:
        from_attribute = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_toke: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[str] = None


