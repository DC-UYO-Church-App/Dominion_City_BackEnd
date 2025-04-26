from fastapi import Query, FastAPI, Depends
# from sqlmodel import SQLModel, Field, create_engine, Session

from sqlmodel import SQLModel, Field, create_engine, Session


from dotenv import load_dotenv
load_dotenv()
import os
DB_USER = os.getenv("DB_USER")
PASSWORD = os.getenv("PASSWORD")
SERVER = os.getenv("SERVER")
PORT = os.getenv("PORT")
DB = os.getenv("DB")
DATABASE_URL = f"postgresql://{DB_USER}:{PASSWORD}@{SERVER}:{PORT}/{DB}"

# DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def init_db():
    try:
        SQLModel.metadata.create_all(engine)
        print("Database logged successfully")
    except Exception as e:
        print(f"Error logging database: {e}")


def get_db():
    with Session(engine) as session:
        yield session