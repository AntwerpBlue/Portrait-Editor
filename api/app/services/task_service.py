from ..database import execute_update
from redis import Redis
from datetime import datetime
import uuid
import time
from flask import current_app

class TaskSubmission:
    def __init__(self):
        self.redis = Redis(current_app.config['REDIS_CONFIG'])
    
    def submit_edit_request(self, project_id, video_id, prompt_id, priority=0):
        # 生成任务ID
        task_id = f"task_{uuid.uuid4().hex[:8]}"
        #request_id = f"req_{uuid.uuid4().hex[:8]}"
        
        # 创建任务数据
        task_data = {
            "task_id": task_id,
            "project_id": project_id,
            "video_id": video_id,
            "prompt_id": prompt_id,
            "status": "waiting",
            "created_at": datetime.now().isoformat(),####
            "priority": priority,
            "progress": 0,
            "estimated_duration": 1800  # 30分钟
        }
        
        # 存储到Redis
        pipeline = self.redis.pipeline()
        pipeline.hset(f"task:{task_id}", mapping=task_data)
        
        # 根据优先级放入不同队列
        if priority > 0:
            pipeline.lpush("queue:high_priority", task_id)
        else:
            pipeline.lpush("queue:pending", task_id)
            
        pipeline.execute()
        
        return task_id

class TaskDispatcher:
    def __init__(self):
        self.redis = Redis(current_app.config['REDIS_CONFIG'])
    
    def start_dispatching(self):
        while True:
            # 1. 检查超时任务
            self._check_timeouts()
            
            # 2. 分配新任务
            self._dispatch_tasks()
            
            time.sleep(10)  # 5秒检查一次
    
    def _check_timeouts(self):
        now = time.time()
        # 获取所有超时任务(超过35分钟无更新)
        timeout_tasks = self.redis.zrangebyscore(
            "zset:timeouts", 0, now - current_app.config['TASK_TIMEOUT']
        )
        
        for task_id in timeout_tasks:
            # 标记任务为失败
            pipeline = self.redis.pipeline()
            pipeline.hset(f"task:{task_id}", "status", "failed")
            pipeline.srem("set:processing", task_id)
            pipeline.zrem("zset:timeouts", task_id)
            pipeline.execute()
    
    def _dispatch_tasks(self):
        # 检查可用worker数量
        available_workers = self.redis.scard("set:available_workers")
        
        while available_workers > 0:
            # 优先处理高优先级任务
            task_id = self.redis.rpoplpush("queue:high_priority", "queue:processing")
            if not task_id:
                task_id = self.redis.rpoplpush("queue:pending", "queue:processing")
                if not task_id:
                    break
            
            # 更新任务状态
            now = time.time()
            pipeline = self.redis.pipeline()
            pipeline.hset(f"task:{task_id}", "status", "processing")
            pipeline.sadd("set:processing", task_id)
            pipeline.zadd("zset:timeouts", {task_id: now})
            pipeline.publish(f"task:{task_id}", "started")
            pipeline.execute()
            
            available_workers -= 1
def update_task_status(task_id, status, result_url):
    if result_url is not None:
        query="UPDATE request SET Status = %s, Result = %s WHERE ProjectID = %s"
        execute_update(query, (status, result_url, task_id))
    else:
        query="UPDATE request SET Status = %s WHERE ProjectID = %s"
        execute_update(query, (status, task_id))