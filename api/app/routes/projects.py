from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services import project_service
from ..exceptions import InvalidRequest

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/get-projects', methods=['POST'])
def get_projects():
    try:
        user_id = request.get_json().get('user_id')
        projects = project_service.get_user_projects(user_id)
        return jsonify(projects)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@projects_bp.route('/rename-project', methods=['POST'])
def rename_project():
    data = request.get_json()
    try:
        project_id = data.get('project_id')
        new_name = data.get('new_name')
    except KeyError:
        raise InvalidRequest("Missing project_id or new_name")
    try:
        project_service.rename_project(project_id, new_name)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@projects_bp.route('/delete-project', methods=['POST'])
def delete_project():
    try:
        project_id = request.form.get('project_id')
        if not project_id:
            raise InvalidRequest("Missing project_id")
        
        project_service.delete_project(project_id)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@projects_bp.route('/check-user', methods=['POST'])
def check_user():
    try:
        user_id = request.get_json().get('user_id')
        count = project_service.check_processing_requests(user_id)
        return jsonify({'processing': count, 'user_id': user_id})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@projects_bp.route('/submit', methods=['POST'])
def submit_project():
    try:
        video_id = request.form.get('videoId')
        prompt_type = request.form.get('promptType')
        prompt = request.form.get('promptContent')
        email = request.form.get('email')
        image_id = request.form.get('imageId') if prompt_type == 'imagePrompt' else None
        relightBG = request.form.get('relightBG') if prompt_type == 'relightening' else None
        project_id=project_service.create_project(
            video_id=video_id,
            prompt_type=prompt_type,
            prompt_content=prompt,
            email=email,
            image_id=image_id,
            relightBG=relightBG,
            user_id=request.form.get('user_id')
        )
        project_service.connect_file_to_project(video_id,project_id,"video")
        if prompt_type == 'imagePrompt':
            project_service.connect_file_to_project(image_id,project_id,"image")
        return jsonify({'success': True, 'message': 'Submit successfully!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500