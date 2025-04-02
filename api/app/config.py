import os
from dotenv import load_dotenv

load_dotenv()  # 加载环境变量

class Config:
    # 安全配置
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-change-me')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    
    # 数据库配置
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # 文件上传
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'static/uploads')
    ALLOWED_EXTENSIONS = {'mp4', 'png', 'jpg'}

    # CORS配置
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')