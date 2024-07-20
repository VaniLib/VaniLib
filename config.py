class FlaskConfig:
    SQLALCHEMY_DATABASE_URI = "sqlite:///database.db"
    SECRET_KEY = "janvi_vijay"
    SECURITY_JOIN_USER_ROLES = True
    SECURITY_PASSWORD_SALT = "janvi_vijay"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"
    CACHE_TYPE = "RedisCache"
    CACHE_REDIS_HOST = "localhost"
    CACHE_REDIS_PORT = 6379
    CACHE_REDIS_DB = 3


class CeleryConfig:
    broker_url = "redis://localhost:6379/1"
    result_backend = "redis://localhost:6379/2"
    timezone = "Asia/Kolkata"
    broker_connection_retry_on_startup = True
