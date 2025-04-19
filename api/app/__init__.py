from flask import Flask
from .routes import auth_bp, projects_bp, uploads_bp, admin_bp
from .config import config
from .extensions import jwt, cors
from .exceptions import register_error_handlers
from .database import init_db
from .redis_service import RedisPool
from .utils.task_scheduler import init_scheduler

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # 初始化扩展
    jwt.init_app(app)
    cors.init_app(app, **app.config['CORS_SETTINGS'])
    init_db(app)

    # 初始化定时任务
    init_scheduler(app)
    # 初始化redis
    app.redis_pool = RedisPool(app)
    
    # 注册错误处理器
    register_error_handlers(app)
    
    # 注册蓝图
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(projects_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(uploads_bp)
    
    return app