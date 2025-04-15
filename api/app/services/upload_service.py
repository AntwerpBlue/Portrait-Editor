import os
import uuid
from flask import current_app
from datetime import datetime
from ..database import execute_query,execute_update

def save_uploaded_file(user_id, file, file_type):
    """保存上传文件"""
    # 创建文件存储目录
    upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], file_type)
    os.makedirs(upload_dir, exist_ok=True)
    
    # 生成唯一文件名
    file_ext = os.path.splitext(file.filename)[1]
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{file_ext}"
    filepath = os.path.join(upload_dir, filename)
    if file_type not in ("image", "video"):  # 防止非法表名
        raise ValueError("Invalid file type")
    query=f"INSERT INTO {file_type} ({file_type}Name, UploadTime, ExpireTime, UploaderID) VALUES (%s, %s, %s, %s)"
    file.save(filepath)
    execute_update(query,(filename, datetime.now(), datetime.now() + current_app.config['FILE_EXPIRE_TIME'], user_id))
    # 保存文件
    return file_id

def check_upload_file(user, file_type):
    if file_type not in ("image", "video"):  # 防止非法表名
        raise ValueError("Invalid file type")
    query= f"SELECT COUNT(*) AS uploaded FROM {file_type} WHERE UploaderID = %s AND UsedProjectID IS NULL"
    count = execute_query(query,(user,),fetch_one=True)['uploaded']
    return count
    