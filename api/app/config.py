import os
import pymysql.cursors
from dotenv import load_dotenv
from datetime import timedelta

# 加载环境变量
load_dotenv()

class Config:
    # JWT 配置
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', '3fa85f64-5717-4562-b3fc-2c963f66afa6')
    JWT_TOKEN_LOCATION = ['cookies']
    JWT_COOKIE_SECURE = True
    JWT_COOKIE_CSRF_PROTECT = True
    
    # 上传文件夹配置
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'static')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'mp4'}
    
    # 数据库配置
    DB_CONFIG = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', 'QAQ122133122wzc'),
        'database': os.getenv('DB_NAME', 'portrait_editor'),
        'cursorclass': pymysql.cursors.DictCursor
    }
    
    # 邮件配置
    MAIL_SERVER = 'smtp.163.com'
    MAIL_PORT = 25
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', 'ustc3dvttttest@163.com')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', 'DEfLZ39hhXn6CxuQ')
    
    # CORS 配置
    CORS_SETTINGS = {
        "origins": ["http://localhost:3000", "https://your-production-domain.com"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Authorization", "Content-Type"],
        "supports_credentials": True,  # 允许携带 Cookie
        "expose_headers": ["Set-Cookie"]
    }

    # 文件配置
    FILE_EXPIRE_TIME = timedelta(minutes=10)
    USED_FILE_EXPIRE_TIME = timedelta(days=30)

    # Redis 配置
    REDIS_CONFIG = {
        'host': os.getenv('REDIS_HOST', 'localhost'),
        'port': int(os.getenv('REDIS_PORT', 6379)),
        'db': 0,                 # 数据库编号(0-15)
        'decode_responses': False, # 是否自动解码返回值为字符串
        'socket_timeout': 30,                # 连接超时(秒)
        'socket_connect_timeout': 5,         # 连接建立超时
        'retry_on_timeout': True,            # 超时自动重试
        'max_connections': 10,              # 连接池最大连接数
        'health_check_interval': 30,         # 健康检查间隔
    }

    WORKER_COUNT=1

    TASK_TIMEOUT = 60*60*2

    # 算法配置
    ALGORITHM_CONFIG = {
        'timeout': timedelta(hours=2),
        'max_attempts': 3
    }

class DevelopmentConfig(Config):
    DEBUG = True
    JWT_COOKIE_SECURE = False  # 开发环境允许非HTTPS

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}