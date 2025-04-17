from datetime import datetime
import uuid
from ..redis_service import redis_task

class TaskService:
    @staticmethod
    def submit_edit_task(project_id, video_id, prompt_type, prompt_content, 
                        image_id=None, light_BG=None, priority=0):
        """提交视频编辑任务"""
        task_id = f"task_{uuid.uuid4().hex[:8]}"
        task_data = {
            "task_id": task_id,
            "project_id": project_id,
            "video_id": video_id,
            "prompt_type": prompt_type,
            "prompt_content": prompt_content,
            "image_id": image_id or "",
            "light_BG": light_BG or "",
            "status": "waiting",
            "created_at": datetime.now().isoformat(),
            "priority": priority,
            "progress": 0,
            "estimated_duration": 1800  # 30分钟
        }
        return redis_task.create_task(task_data, priority)