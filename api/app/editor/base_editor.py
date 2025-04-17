from abc import ABC, abstractmethod
from typing import Optional, Callable, Any, Dict

class BaseEditor(ABC):
    """编辑器抽象基类"""
    
    def __init__(self, task_data:Dict[str,Any]):
        """
        初始化编辑器
        
        :param task_data: 包含任务相关数据的字典
        """
        self.task_data = task_data
        self.validate_task_data()

    def validate_task_data(self):
        """验证任务数据是否完整"""
        required_fields = self.get_required_fields()
        for field in required_fields:
            if field not in self.task_data:
                raise ValueError(f"缺少必要字段: {field}")
    
    @abstractmethod
    def get_required_fields(self) -> list:
        """获取此编辑器需要的必要字段列表"""
        return []
    
    @abstractmethod
    def process(self, progress_callback: Optional[Callable[[int, str], None]] = None) -> str:
        """
        处理主方法
        
        :param progress_callback: 进度回调函数，接受(progress: int, message: str)
        :return: 处理后的文件路径
        """
        pass
    
    def cleanup(self):
        """清理临时资源"""
        pass
    
    def __enter__(self):
        """支持上下文管理器"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """退出上下文时自动清理"""
        self.cleanup()