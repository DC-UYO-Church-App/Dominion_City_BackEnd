from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime, timezone



class Registration(SQLModel, table=True):
    __tablename__ = "users"
    id: Optional[int] = Field(default=None, primary_key=True)
    firstname: str = Field(index=True, nullable=False)
    lastname: str = Field(index=True, nullable=False)
    email: str = Field(index=True, unique=True, nullable=False)
    phone_number: str = Field(index=True, nullable=False)
    password: str
    date_registered: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    points: int = Field(nullable=True, default=0)