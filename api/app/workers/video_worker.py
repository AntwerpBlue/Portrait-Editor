import time
import json
from redis import Redis
from flask import current_app
from config import Config

class VideoEditorWorker:
    def __init__(self, worker_id):
        self.worker_id = worker_id
        self.redis = Redis(current_app.config['REDIS_CONFIG'])
        self.pubsub = self.redis.pubsub()
    
    def start(self):
        # 注册为可用worker
        self.redis.sadd("set:available_workers", self.worker_id)
        
        # 订阅任务分配
        self.pubsub.subscribe(**{
            f"worker:{self.worker_id}": self.handle_task_assignment
        })
        self.pubsub.run_in_thread()
    
    def handle_task_assignment(self, message):
        task_id = message['data'].decode()
        
        try:
            # 标记为忙碌
            self.redis.srem("set:available_workers", self.worker_id)
            
            # 获取任务详情
            task_data = self.redis.hgetall(f"task:{task_id}")
            
            editor = AlgorithmEditor(task_data)
            
            def progress_callback(progress, message):
                self.redis.hset(f"task:{task_id}", "progress", progress)
                self.redis.zadd("zset:timeouts", {task_id: time.time()})
                self.redis.publish(
                    f"task:{task_id}",
                    json.dumps({"progress": progress, "message": message})
                )

            result_path=editor.process(progress_callback=progress_callback)
            
            # 标记完成
            self.redis.hset(f"task:{task_id}", "status", "completed")
            self.redis.srem("set:processing", task_id)
            self.redis.zrem("zset:timeouts", task_id)
            
        except Exception as e:
            self.redis.hset(f"task:{task_id}", "status", "failed")
            self.redis.publish(f"task:{task_id}", f"error:{str(e)}")
            
        finally:
            # 重新标记为可用
            self.redis.sadd("set:available_workers", self.worker_id)