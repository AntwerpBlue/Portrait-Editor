import redis
import time
import json
import threading
from datetime import datetime
from flask import current_app
from ..editor.video_editor import AlgorithmEditor
from ..utils.email_utils import send_result_email
from ..database import execute_update
from ..utils.thumbnail_gen import get_thumbnail

class TaskConsumer:
    def __init__(self, app):
        self.running = True
        self.app=app
        self._stop_event = threading.Event()

    def graceful_shutdown(self):
        self._stop_event.set()

    def _update_task_status(self, project_id, status, **kwargs):
        """更新任务状态（原子操作）"""
        with self.app.redis_pool.client.pipeline() as pipe:
            while True:
                try:
                    pipe.watch(f"task:{project_id}")
                    current_status = pipe.hget(f"task:{project_id}", "status")
                    if current_status and current_status.decode() != "waiting":
                        pipe.unwatch()
                        return False

                    pipe.multi()
                    update_data = {"status": status, **kwargs}
                    if status == "processing":
                        update_data["started_at"] = datetime.now().isoformat()
                        execute_update("UPDATE request SET Status = %s WHERE ProjectID = %s", ("processing", project_id))
                    elif status in ("completed", "failed"):
                        update_data["finished_at"] = datetime.now().isoformat()
                    
                    pipe.hset(f"task:{project_id}", mapping=update_data)
                    pipe.execute()
                    return True
                
                except redis.WatchError:
                    continue

    def process_task(self, task_data):
        project_id = task_data["project_id"]
        email = task_data["email"]
        
        # 1. 状态验证和更新为processing
        if not self._update_task_status(project_id, "processing"):
            current_app.logger.warning(f"Task {project_id} is not in waiting state, skipped")
            return

        # 2. 调用Editor处理（核心业务逻辑）
        try:
            with self.app.app_context():  # 确保Flask上下文
                editor = AlgorithmEditor(task_data)
                self.app.logger.info(f"Task {project_id} started")
                result = editor.process()

            # 3. 处理成功更新状态
            self._update_task_status(
                project_id,
                "completed",
                result_url=result,
                progress=100
            )
            current_app.logger.info(f"generate thumbnail for video {task_data['video_id']}")
            thumbnail=get_thumbnail(task_data["video_id"],current_app.config['UPLOAD_FOLDER'])
            query="UPDATE request SET Status = %s, Result = %s, CompleteTime = %s, ThumbNail = %s WHERE ProjectID = %s"
            execute_update(query, ("completed", result, datetime.now(),thumbnail, project_id))
            send_result_email(email, project_id, result)
            current_app.logger.info(f"Task {project_id} completed")
        except Exception as e:
            # 4. 处理失败更新状态
            self._update_task_status(
                project_id,
                "failed",
                error=str(e),
                progress=0
            )
            current_app.logger.error(f"Task {project_id} failed: {str(e)}")

    def run(self):        
        while not self._stop_event.is_set():
            try:
                # 阻塞式获取任务（带超时）
                redis_client = self.app.redis_pool.client
                task_json = redis_client.brpop('edit_tasks', timeout=10)
                
                if task_json:
                    _, task_data = task_json
                    self.process_task(json.loads(task_data))
            except redis.ConnectionError:
                current_app.logger.warning("Redis connection lost, reconnecting...")
                time.sleep(5)
            except Exception as e:
                current_app.logger.error(f"Consumer error: {str(e)}")
                time.sleep(1)
            if self._stop_event.wait(1):  # 带超时的等待
                break