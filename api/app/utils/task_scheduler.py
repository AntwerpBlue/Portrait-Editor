from apscheduler.schedulers.background import BackgroundScheduler
from ..services.file_cleanup_service import cleanup_expired_files
from flask_apscheduler import APScheduler

scheduler = None  # 全局调度器实例

def init_scheduler(app):
    global scheduler
    if scheduler is not None and scheduler.running:
        return  # 避免重复初始化

    scheduler = BackgroundScheduler()

    def clean_with_context():
        with app.app_context():
            cleanup_expired_files(app)

    scheduler.add_job(
        func=clean_with_context,
        trigger="interval",
        seconds=10,
        id="file_cleanup_job"
    )
    scheduler.start()
    app.logger.info("Scheduler started.")