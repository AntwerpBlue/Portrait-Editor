from flask import Flask
from .config import Config
from .extensions import jwt, db, mail, cors

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # 初始化扩展
    jwt.init_app(app)
    db.init_app(app)
    mail.init_app(app)
    cors.init_app(app, resources={
        r"/api/*": {"origins": app.config['CORS_ORIGINS']}
    })

    # 注册蓝图
    from .routes.auth import auth_bp
    from .routes.video import video_bp
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(video_bp, url_prefix='/api/video')

    # 创建数据库表（开发环境）
    with app.app_context():
        db.create_all()

    return app