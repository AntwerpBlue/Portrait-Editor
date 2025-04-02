import uuid
from datetime import datetime
from ..models.video import VideoProject
from ..extensions import db
from ..utils.file import save_uploaded_file

class VideoService:
    @staticmethod
    def handle_upload(file):
        if not file:
            return {'error': 'No file provided'}, 400
        
        file_id = str(uuid.uuid4())
        file_path = save_uploaded_file(file, file_id)
        
        project = VideoProject(
            id=file_id,
            name=file.filename,
            thumbnail_path=f"{file_id}_thumbnail.jpg",
            status='uploaded'
        )
        db.session.add(project)
        db.session.commit()
        
        return {'project_id': file_id}, 201