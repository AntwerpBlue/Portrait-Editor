from werkzeug.security import generate_password_hash, check_password_hash
from ..database import execute_query, execute_update
from ..utils.auth_utils import generate_reset_token, verify_reset_token
from ..utils.validators import is_email_valid
from datetime import datetime

def register_user(username, password, email):
    """用户注册服务"""
    if not is_email_valid(email):
        raise ValueError("邮箱格式不正确")

    # 检查邮箱是否已存在
    existing_user = execute_query(
        "SELECT * FROM user WHERE Mail = %s", 
        (email,), 
        fetch_one=True
    )
    if existing_user:
        raise ValueError("该邮箱已被注册")

    id=execute_query(
        "SELECT COUNT(*) AS counter FROM user", fetch_one=True
    )['counter']
    # 插入新用户
    hashed_password = generate_password_hash(password)
    execute_update(
        "INSERT INTO user (Name, Password, Mail, UserID, IsAdmin) VALUES (%s, %s, %s, %s, %s)",
        (username, hashed_password, email, id+1, 0)
    )
    
    # 获取新用户ID
    new_user = execute_query(
        "SELECT UserID FROM user WHERE Mail = %s",
        (email,),
        fetch_one=True
    )
    return new_user['UserID']

def verify_login(username, password):
    """用户登录验证"""
    user = execute_query(
        "SELECT * FROM user WHERE Name = %s", 
        (username,), 
        fetch_one=True
    )
    if not user or not check_password_hash(user['Password'], password):
        return None
    return {
        'user_id': user['UserID'],
        'username': user['Name'],
        'mail': user['Mail'],
        'isAdmin': user['IsAdmin']
    }

def initiate_password_reset(email, username):
    """发起密码重置流程"""
    user = execute_query(
        "SELECT * FROM user WHERE Mail = %s AND Name = %s",
        (email, username),
        fetch_one=True
    )
    if not user:
        raise ValueError("邮箱与用户名不匹配")
    return True

def reset_password(email,new_password):
    """重置密码"""
    query="SELECT * FROM user WHERE Mail = %s"
    user=execute_query(query,(email,),fetch_one=True)['UserID']
    if not user:
        raise ValueError("User not found")
    hashed_password = generate_password_hash(new_password)
    execute_update('UPDATE user SET Password = %s WHERE Mail = %s', (hashed_password, email))
    return True
