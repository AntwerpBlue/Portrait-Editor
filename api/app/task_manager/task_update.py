from ..database import execute_update

def update_task_status(project_id, status, result_url=None):
    """更新数据库中的任务状态"""
    if result_url is not None:
        query = """
            UPDATE request 
            SET Status = %s, Result = %s, CompleteTime = NOW() 
            WHERE ProjectID = %s
        """
        params = (status, result_url, project_id)
    
    execute_update(query, params)
    
    # 如果是完成状态，更新完成时间
    if status == "completed":
        execute_update(
            "UPDATE request SET CompleteTime = NOW() WHERE ProjectID = %s",
            (project_id,)
        )
    