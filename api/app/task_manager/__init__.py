from threading import Thread
from .task_dispatch import TaskDispatcher
from .task_worker import VideoEditorWorker

class TaskManager:
    """任务管理器封装类"""
    
    def __init__(self):
        self.dispatcher = None
        self.dispatcher_thread = None
        self.workers = []
        self.worker_threads = []
    
    def init_app(self, app):
        """初始化任务管理器"""
        self.app = app
        # 初始化调度器和Worker
        self.init_dispatcher(app)
        self.init_workers()
    
    def init_dispatcher(self,app):
        """初始化任务调度器"""
        self.dispatcher = TaskDispatcher(app)
        self.dispatcher_thread = Thread(
            target=self.dispatcher.start_dispatching,
            daemon=True,
            name="TaskDispatcher"
        )
        self.dispatcher_thread.start()
    
    def init_workers(self, num_workers=None):
        """初始化工作线程"""
        if num_workers is None:
            num_workers = self.app.config['WORKER_COUNT']
        
        for i in range(num_workers):
            worker = VideoEditorWorker(f"worker_{i}")
            worker_thread = Thread(
                target=worker.start,
                daemon=True,
                name=f"VideoWorker-{i}"
            )
            worker_thread.start()
            self.workers.append(worker)
            self.worker_threads.append(worker_thread)
    
    def stop(self):
        """停止所有任务处理"""
        if self.dispatcher:
            self.dispatcher.stop()
        
        for worker in self.workers:
            worker.stop()
        
        # 等待线程结束
        if self.dispatcher_thread:
            self.dispatcher_thread.join(timeout=5)
        
        for thread in self.worker_threads:
            thread.join(timeout=2)