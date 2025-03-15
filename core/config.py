import secrets

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Dominion City Uyo Church Attendance App"
    PROJECT_VERSION: str = "0.0.1"
    PROJECT_DESCRIPTION: str = "A comprehensive mobile application that streamlines church operations, improves communication, tracks attendance and engagement, and enhances administrative efficiency for Dominion City Uyo (Golden Heart) Church. "
    API_PREFIX: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    DEBUG: bool = False
    TESTING: bool = False


settings = Settings()