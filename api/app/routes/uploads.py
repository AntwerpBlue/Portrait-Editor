import os
import uuid
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from werkzeug.utils import secure_filename
from ..services import upload_service

uploads_bp = Blueprint('uploads', __name__)

@uploads_bp.route('/uploadVideo', methods=['POST'])
def upload_video():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    user_id= request.form.get('user_id')
    count = upload_service.check_upload_file(user_id,"video")
    if count >= 5:
        return jsonify({'error': 'Uploaded files limit exceeded, please try again later'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not file.filename.lower().endswith('.mp4'):
        return jsonify({'error': 'Only MP4 files allowed'}), 400
    
    try:
        file_id = upload_service.save_uploaded_file(user_id, file, "video")
        return jsonify({'file_id': file_id})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@uploads_bp.route('/uploadImage', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    user_id= request.form.get('user_id')
    count = upload_service.check_upload_file(user_id,"image")
    if count >= 5:
        return jsonify({'error': 'Uploaded files limit exceeded, please try again later'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        return jsonify({'error': 'Only image files allowed'}), 400
    
    try:
        file_id = upload_service.save_uploaded_file(user_id, file, 'image')
        return jsonify({'file_id': file_id})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@uploads_bp.route('/api/videos/<filename>')
def serve_video(filename):
    return send_from_directory(
        os.path.join(current_app.config['UPLOAD_FOLDER'], 'result'),
        filename,
        as_attachment=True
    )

@uploads_bp.route('/api/images/<filename>')
def serve_image(filename):
    return send_from_directory(
        os.path.join(current_app.config['UPLOAD_FOLDER'], 'image'),
        filename
    )