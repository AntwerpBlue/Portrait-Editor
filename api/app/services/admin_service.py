from ..database import execute_query

def get_system_stats():
    """获取系统统计信息"""
    total_users = execute_query(
        """
        SELECT COUNT(*) AS total_users from user
        """,
        fetch_one=True
    )["total_users"]
    weekly_requests = execute_query(
        """
        SELECT COUNT(*) AS weekly_requests FROM request WHERE UploadTime >= DATE(NOW()) - INTERVAL 1 WEEK
        """,
        fetch_one=True
    )["weekly_requests"]
    total_requests = execute_query(
        """
        SELECT COUNT(*) AS total_requests FROM request
        """,
        fetch_one=True
    )["total_requests"]
    return {'total_users': total_users, 'weekly_requests': weekly_requests, 'total_requests': total_requests}

def get_all_projects(start_date=None, end_date=None, prompt_type=None):
    """管理员获取所有项目"""
    where_clauses = []
    params = []
    
    if start_date:
        where_clauses.append("UploadTime >= %s")
        params.append(start_date)
    if end_date:
        where_clauses.append("UploadTime <= %s")
        params.append(end_date)
    if prompt_type:
        where_clauses.append("PromptType = %s")
        params.append(prompt_type)
    
    where = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""
    
    query = f"""
        SELECT 
            ProjectID, UserID, PromptType, PromptContent, 
            DATE_FORMAT(UploadTime, '%%Y-%%m-%%d %%H:%%i:%%s') as UploadTime,
            DATE_FORMAT(CompleteTime, '%%Y-%%m-%%d %%H:%%i:%%s') as CompleteTime,
            Status 
        FROM request
        {where}
        ORDER BY UploadTime DESC
    """
    return execute_query(query, params)