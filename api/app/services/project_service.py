from ..database import execute_query, execute_update
from datetime import datetime
from flask import current_app
import json
import redis
import uuid

def create_project(video_id, prompt_type, prompt_content, email, user_id, image_id=None, relightBG=None):
    """创建新项目"""
    if prompt_type == 'imagePrompt' and not image_id:
        raise ValueError("图片引导需要上传图片")

    if prompt_type == 'relightening' and not relightBG:
        raise ValueError("重光照背景需要上传光照方向")
    # 构建动态SQL
    columns = ["VideoURL", "PromptType", "PromptContent", "Email", "UserID", "UploadTime","Status", "Name"]
    values = [video_id, prompt_type, prompt_content, email, user_id, datetime.now(), "waiting", video_id]
    
    if image_id:
        columns.append("Image")
        values.append(image_id)

    if relightBG:
        columns.append("RelightBG")
        values.append(relightBG)

    columns.append("ProjectID")
    project_id=str(uuid.uuid4())
    values.append(project_id)

    query = f"""
        INSERT INTO request 
        ({', '.join(columns)}) 
        VALUES ({', '.join(['%s']*len(values))})
    """
    execute_update(query, values)

    task_id=submit_edit_request(
        project_id=project_id,
        email=email,
        video_id=video_id,
        prompt_type=prompt_type,
        prompt_content=prompt_content,
        image_id=image_id if prompt_type == 'imagePrompt' else None,
        relightBG=relightBG if prompt_type == 'relightBG' else None,
    )
    
    execute_update(
        "UPDATE request SET TaskID = %s WHERE ProjectID = %s",
        (task_id, project_id)
    )
    return project_id

def submit_edit_request(project_id, email, video_id, prompt_type, prompt_content, image_id=None, relightBG=None):
    """使用连接池的生产者"""
    redis_client = current_app.redis_pool.client
    try:
        task_data = {
            "project_id": project_id,
            "email": email,
            "video_id": video_id,
            "prompt_type": prompt_type,
            "prompt_content": prompt_content,
            "image_id": image_id,
            "relightBG": relightBG,
            "created_at": datetime.now().isoformat()
        }
        
        # 使用管道保证原子性
        with redis_client.pipeline() as pipe:
            pipe.lpush('edit_tasks', json.dumps(task_data))
            pipe.hset(f"task:{project_id}", mapping={
                "status": "waiting",
                "created_at": task_data["created_at"]
            })
            pipe.execute()
            
        return f"redis-{project_id}"
    except redis.RedisError as e:
        current_app.logger.error(f"Redis operation failed: {str(e)}")
        raise

def get_user_projects(user_id):
    """获取用户所有项目"""
    return execute_query(
        """
        SELECT ProjectID, Name, ThumbNail, Status, UploadTime, CompleteTime, Result, PromptType,PromptContent, RelightBG
        FROM request 
        WHERE UserID = %s 
        ORDER BY UploadTime DESC
        """,
        (user_id,)
    )

def rename_project(project_id, new_name):
    """重命名项目"""
    affected = execute_update(
        "UPDATE request SET Name = %s WHERE ProjectID = %s",
        (new_name, project_id)
    )
    if affected == 0:
        raise ValueError("项目不存在")


### FIXME: 外键约束
def delete_project(project_id):
    """删除项目"""
    execute_update(
        "DELETE FROM request WHERE ProjectID = %s",
        (project_id,)
    )

def check_processing_requests(project_id):
    count= execute_query(
        "SELECT COUNT(*) AS counter FROM request WHERE UserID = %s AND Status = 'processing'",
        (project_id,),fetch_one=True
    )
    return count['counter']

def connect_file_to_project(file_name,project_id,file_type):
    if file_type not in ("image", "video"):  # 防止非法表名
        raise ValueError("Invalid file type")
    query=f"UPDATE {file_type} SET UsedProjectID = %s, ExpireTime = %s WHERE SUBSTRING_INDEX({file_type}Name,'.',1) = %s"
    execute_update(
        query,(project_id,datetime.now() + current_app.config['USED_FILE_EXPIRE_TIME'] ,file_name)
    )