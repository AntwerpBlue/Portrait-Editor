class EditorError(Exception):
    """编辑器基础异常"""
    pass

class InvalidVideoFormatError(EditorError):
    """无效视频格式异常"""
    pass

class ProcessingTimeoutError(EditorError):
    """处理超时异常"""
    pass