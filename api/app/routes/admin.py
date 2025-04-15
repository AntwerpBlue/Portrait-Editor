from flask import Blueprint, request, jsonify
from ..services import admin_service

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/stats', methods=['POST'])
def get_stats():
    if request.get_json().get('isAdmin')==1:
        try:
            stats = admin_service.get_system_stats()
            return jsonify(stats)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Unauthorized'}), 401

@admin_bp.route('/projects', methods=['POST'])
def get_all_projects():
    if request.get_json().get('isAdmin')==1:
        try:
            start_date = request.get_json().get('start')
            end_date = request.get_json().get('end')
            prompt_type = request.get_json().get('promptType')
            
            projects = admin_service.get_all_projects(
                start_date=start_date,
                end_date=end_date,
                prompt_type=prompt_type
            )
            return jsonify(projects)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Unauthorized'}), 401