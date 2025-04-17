import time
from flask import current_app
from ..redis_service import redis_task

class TaskDispatcher:
    def __init__(self, app):
        self.app = app
    
    def start_dispatching(self):
        """启动任务分发循环"""
        while True:
            try:
                self._check_timeouts()
                self._dispatch_tasks()
                time.sleep(self.app.config.get('DISPATCH_INTERVAL', 10))
            except Exception as e:
                current_app.logger.error(f"Dispatcher error: {str(e)}")
                time.sleep(60)

    def _check_timeouts(self):
        """检查超时任务"""
        now = time.time()
        timeout = self.app.config['TASK_TIMEOUT']
        timeout_tasks = redis_task.get_conn().zrangebyscore(
            "zset:timeouts", 0, now - timeout
        )
        
        with redis_task.pipeline() as pipe:
            for task_id in timeout_tasks:
                pipe.hset(f"task:{task_id}", "status", "failed")
                pipe.srem("set:processing", task_id)
                pipe.zrem("zset:timeouts", task_id)

    def _dispatch_tasks(self):
        """分发任务给worker"""
        available = redis_task.get_conn().scard("set:available_workers")
        while available > 0:
            task_id = self._get_next_task()
            if not task_id:
                break
            self._assign_task(task_id)
            available -= 1

    def _get_next_task(self):
        """获取下一个待处理任务"""
        conn = redis_task.get_conn()
        return (conn.rpoplpush("queue:high_priority", "queue:processing") or 
                conn.rpoplpush("queue:pending", "queue:processing"))

    def _assign_task(self, task_id):
        """分配任务"""
        with redis_task.pipeline() as pipe:
            pipe.hset(f"task:{task_id}", "status", "processing")
            pipe.sadd("set:processing", task_id)
            pipe.zadd("zset:timeouts", {task_id: time.time()})
            pipe.publish(f"task:{task_id}", "started")