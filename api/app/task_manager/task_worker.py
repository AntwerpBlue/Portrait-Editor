import threading
from ..redis_service import redis_task
from ..task_manager.task_submission import TaskService

class VideoWorker:
    def __init__(self, worker_id):
        self.worker_id = worker_id
        self._running = False
    
    def start(self):
        """启动worker线程"""
        self._running = True
        self.thread = threading.Thread(
            target=self._run_loop,
            daemon=True,
            name=f"VideoWorker-{self.worker_id}"
        )
        self.thread.start()

    def _run_loop(self):
        """主工作循环"""
        conn = redis_task.get_conn()
        conn.sadd("set:available_workers", self.worker_id)
        
        pubsub = conn.pubsub()
        pubsub.subscribe(f"worker:{self.worker_id}")
        
        try:
            while self._running:
                msg = pubsub.get_message(
                    ignore_subscribe_messages=True,
                    timeout=1.0
                )
                if msg:
                    self._handle_task(msg)
        finally:
            pubsub.unsubscribe()
            conn.srem("set:available_workers", self.worker_id)

    def _handle_task(self, message):
        """处理任务分配"""
        task_id = message['data'].decode()
        conn = redis_task.get_conn()
        
        try:
            conn.srem("set:available_workers", self.worker_id)
            conn.sadd("set:processing", task_id)
            
            task_data = conn.hgetall(f"task:{task_id}")
            # 实际任务处理逻辑...
            self._process_task(task_data)
            
            conn.hset(f"task:{task_id}", "status", "completed")
        except Exception as e:
            conn.hset(f"task:{task_id}", "status", "failed")
            conn.hset(f"task:{task_id}", "error", str(e))
        finally:
            conn.srem("set:processing", task_id)
            conn.sadd("set:available_workers", self.worker_id)