from pydantic import BaseModel, EmailStr

class RegisterUser(BaseModel):
    firstname: str
    lastname: str
    email: EmailStr
    phonenumber: int
    password: str

    class Config:
        from_attributes: True