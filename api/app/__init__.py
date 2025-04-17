from flask import Flask
from .routes import auth_bp, projects_bp, uploads_bp, admin_bp, task_bp
from .config import config
from .extensions import jwt, cors
from .exceptions import register_error_handlers
from .database import init_db
from redis_service import redis_task
import threading
from task_manager.task_dispatch import TaskDispatcher
from task_manager.task_worker import VideoWorker
from .task_manager import TaskManager
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
    redis_task.init_app(app)
    if not app.testing:
        _start_task_system(app)

    # 初始化任务调度器
    task_manager = TaskManager()
    task_manager.init_app(app)
    
    # 注册错误处理器
    register_error_handlers(app)
    
    # 注册蓝图
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(projects_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(uploads_bp)
    app.register_blueprint(task_bp, url_prefix='/api/task')
    
    return app

def _start_task_system(app):
    """启动任务调度器和workers"""
    # 调度器
    dispatcher = TaskDispatcher(app)
    threading.Thread(
        target=dispatcher.start_dispatching,
        daemon=True
    ).start()
    
    # Workers
    worker_count = app.config.get('WORKER_COUNT', 4)
    for i in range(worker_count):
        worker = VideoWorker(f"worker_{i}")
        worker.start()