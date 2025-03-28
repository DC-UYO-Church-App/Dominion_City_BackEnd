from pydantic import BaseModel, EmailStr

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

    class Config:
        from_attribute = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    class Config:
        from_attributes = True