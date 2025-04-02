from flask import Blueprint, request
from ..services.video_service import VideoService
from ..utils.auth import jwt_required

video_bp = Blueprint('video', __name__)

@video_bp.route('/projects', methods=['GET'])
@jwt_required()
def list_projects():
    user_id = get_jwt_identity()
    return VideoService.get_user_projects(user_id)

@video_bp.route('/upload', methods=['POST'])
def upload_video():
    file = request.files.get('file')
    return VideoService.handle_upload(file)