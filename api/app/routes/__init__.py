from .auth import auth_bp
from .projects import projects_bp
from .admin import admin_bp
from .uploads import uploads_bp

__all__ = ['auth_bp', 'projects_bp', 'admin_bp', 'uploads_bp', 'task_bp']