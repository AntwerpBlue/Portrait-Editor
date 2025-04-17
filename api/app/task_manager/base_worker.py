import threading
import time
from abc import ABC, abstractmethod
from flask import current_app
from ..redis_service import redis_task

class BaseWorker(ABC):
    """工作者基类"""
    
    def __init__(self, worker_id):
        """
        初始化工作者
        :param worker_id: 工作者唯一ID
        :param redis_config: Redis连接配置
        """
        self.worker_id = worker_id
        self.redis = redis_task.get_redis()
        self._running = False
        self._thread = None
    
    def start(self):
        """启动工作者线程"""
        if self._running:
            return
            
        self._running = True
        self._thread = threading.Thread(
            target=self._run_loop,
            daemon=True,
            name=f"Worker-{self.worker_id}"
        )
        self._thread.start()
    
    def stop(self):
        """停止工作者线程"""
        self._running = False
        if self._thread:
            self._thread.join(timeout=5)
    
    def _run_loop(self):
        """工作者主循环"""
        # 注册为可用worker
        self.redis.sadd("set:available_workers", self.worker_id)
        
        # 订阅任务分配频道
        self.redis.pubsub.subscribe(**{
            f"worker:{self.worker_id}": self._handle_message
        })
        
        # 开始监听消息
        while self._running:
            try:
                message = self.redis.pubsub.get_message(
                    ignore_subscribe_messages=True,
                    timeout=1.0
                )
                if message:
                    self._handle_message(message)
            except Exception as e:
                current_app.logger.error(f"Worker {self.worker_id} error: {str(e)}")
                time.sleep(5)
        
        # 清理资源
        self.redis.pubsub.unsubscribe()
        self.redis.srem("set:available_workers", self.worker_id)
    
    def _handle_message(self, message):
        """处理收到的消息"""
        if message['type'] == 'message':
            self.handle_task_assignment(message)
    
    @abstractmethod
    def handle_task_assignment(self, message):
        """处理任务分配(子类必须实现)"""
        pass