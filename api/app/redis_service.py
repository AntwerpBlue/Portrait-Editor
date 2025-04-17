import redis
from redis.connection import ConnectionPool
from flask import current_app, _app_ctx_stack
from functools import wraps
import json
import time
from contextlib import contextmanager

class RedisTaskService:
    def __init__(self, app=None):
        self.app = app
        self.pool = None
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        """Initialize with app configuration"""
        app.config.setdefault('REDIS_TASK_CONFIG', {
            'host': 'localhost',
            'port': 6379,
            'db': 1,  # 使用专门的DB
            'max_connections': 20,
            'socket_timeout': 30,
            'health_check_interval': 30
        })
        self.pool = ConnectionPool(**app.config['REDIS_TASK_CONFIG'])
        app.teardown_appcontext(self.teardown)

    def get_conn(self):
        """Get thread-safe Redis connection"""
        ctx = _app_ctx_stack.top
        if ctx is None:
            raise RuntimeError("Working outside of application context")
        if not hasattr(ctx, 'redis_task_conn'):
            ctx.redis_task_conn = redis.Redis(connection_pool=self.pool)
        return ctx.redis_task_conn

    def teardown(self, exception):
        """Cleanup connection"""
        ctx = _app_ctx_stack.top
        if hasattr(ctx, 'redis_task_conn'):
            ctx.redis_task_conn.connection_pool.disconnect()
            del ctx.redis_task_conn

    @contextmanager
    def pipeline(self):
        """Provide transactional pipeline"""
        conn = self.get_conn()
        pipe = conn.pipeline()
        try:
            yield pipe
            pipe.execute()
        except Exception as e:
            pipe.reset()
            current_app.logger.error(f"Redis pipeline failed: {str(e)}")
            raise

    # 任务操作封装
    def create_task(self, task_data, priority=0):
        """创建新任务"""
        with self.pipeline() as pipe:
            pipe.hset(f"task:{task_data['task_id']}", mapping=task_data)
            queue = "queue:high_priority" if priority > 0 else "queue:pending"
            pipe.lpush(queue, task_data['task_id'])
        return task_data['task_id']

    def get_task(self, task_id):
        """获取任务详情"""
        conn = self.get_conn()
        return conn.hgetall(f"task:{task_id}")

    def update_task_progress(self, task_id, progress, message):
        """更新任务进度"""
        with self.pipeline() as pipe:
            pipe.hset(f"task:{task_id}", "progress", progress)
            pipe.hset(f"task:{task_id}", "message", message)
            pipe.zadd("zset:timeouts", {task_id: time.time()})
            pipe.publish(f"task:{task_id}", json.dumps({
                "progress": progress,
                "message": message
            }))

# 全局单例
redis_task = RedisTaskService()