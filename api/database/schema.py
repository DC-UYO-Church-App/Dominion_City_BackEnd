from pydantic import BaseModel, EmailStr

class RegisterUser(BaseModel):
    firstname: str
    lastname: str
    email: EmailStr
    phone_number: int
    password: str

    class Config:
        from_attributes: True


class RegisterResponse(BaseModel):
    firstname: str
    lastname: str
    email: EmailStr
    phone_number: int
    password: str

    class Config:
        from_attribute: True