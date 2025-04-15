import pymysql
import pymysql.cursors
from dbutils.pooled_db import PooledDB
from flask import current_app
from functools import wraps

def init_db(app):
    global pool
    pool = PooledDB(
        creator=pymysql,
        maxconnections=10,
        **app.config['DB_CONFIG']
    )

def execute_query(query, params=None, fetch_one=False):
    """执行SQL查询"""
    conn = pool.connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, params or ())
            if fetch_one:
                return cursor.fetchone()
            return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

def execute_update(query, params=None):
    """执行更新操作"""
    conn = pool.connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, params or ())
            conn.commit()
            return cursor.rowcount
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

def with_transaction(func):
    """事务控制装饰器（支持自动提交/回滚）"""
    @wraps(func)
    def wrapper(app, *args, **kwargs):
        conn = None
        cursor = None
        try:
            # 从连接池获取连接
            conn = pool.connection()
            cursor = conn.cursor(pymysql.cursors.DictCursor)

            cursor.execute("BEGIN")  # 开始事务
            # 将连接和游标注入被装饰函数
            kwargs['conn'] = conn
            kwargs['cursor'] = cursor
            
            # 执行函数
            with app.app_context():
                result = func(app, *args, **kwargs)
                # 提交事务
                conn.commit()
                return result
            
        except Exception as e:
            # 回滚事务
            if conn:
                conn.rollback()
            app.logger.error(
                f"事务执行失败: {str(e)}",
                exc_info=True
            )
            raise  # 重新抛出异常
            
        finally:
            # 清理资源
            if cursor:
                cursor.close()
            if conn:
                conn.close()
    
    return wrapper

