from ..database import execute_query, execute_update
from datetime import datetime
from flask import current_app

def create_project(video_id, prompt_type, prompt_content, email, user_id, image_id=None, relightBG=None):
    """创建新项目"""
    if prompt_type == 'imagePrompt' and not image_id:
        raise ValueError("图片引导需要上传图片")

    if prompt_type == 'relightBG' and not relightBG:
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
    project_counter=execute_query("SELECT COUNT(*) AS counter FROM request",fetch_one=True)['counter']
    values.append(project_counter+1)

    query = f"""
        INSERT INTO request 
        ({', '.join(columns)}) 
        VALUES ({', '.join(['%s']*len(values))})
    """
    execute_update(query, values)
    return project_counter+1

def get_user_projects(user_id):
    """获取用户所有项目"""
    return execute_query(
        """
        SELECT ProjectID, Name, ThumbNail, Status, UploadTime, CompleteTime, Result 
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