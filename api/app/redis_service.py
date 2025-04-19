import redis
from threading import Thread

class RedisPool:
    def __init__(self, app=None):
        self.pool = None
        if app is not None:
            self.init_pool(app)
    def init_pool(self, app):
        """延迟初始化"""
        if self.pool is None:
            try:
                self.pool = redis.ConnectionPool(
                    host=app.config['REDIS_HOST'],
                    port=app.config['REDIS_PORT'],
                    db=app.config['REDIS_DB']
                )
                app.logger.info('Redis pool initialized')
                if app.config.get('ENABLE_BACKGROUND_WORKER', True):
                    self._start_background_worker(app)
                    app.logger.info('Background worker started')
            except Exception as e:
                app.logger.error(f'Failed to initialize Redis pool: {e}')

    def _start_background_worker(self, app):
        """启动后台线程"""
        def run_worker():
            with app.app_context():  # 确保上下文
                from .services.woker_service import TaskConsumer
                consumer = TaskConsumer(app)
                consumer.run()

        Thread(target=run_worker, daemon=True).start()

    @property
    def client(self):
        return redis.Redis(connection_pool=self.pool)