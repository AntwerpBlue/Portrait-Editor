from flask import jsonify
from werkzeug.exceptions import HTTPException

class InvalidRequest(HTTPException):
    code = 400
    description = 'Invalid request'

class Unauthorized(HTTPException):
    """401 Unauthorized 错误"""
    code = 401
    description = '认证失败：请提供有效的凭据或登录'

def handle_http_exception(e):
    """处理HTTP异常"""
    response = jsonify({
        'success': False,
        'error': e.description
    })
    response.status_code = e.code
    return response

def register_error_handlers(app):
    """注册错误处理器"""
    app.register_error_handler(InvalidRequest, handle_http_exception)

