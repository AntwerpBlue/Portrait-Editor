from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pymysql
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER='./files'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

db_config={
    'host': 'localhost',
    'user': 'root',
    'password': 'QAQ122133122wzc',
    'database': 'portrait_editor',
}

def get_db_connection():
    return pymysql.connect(**db_config)

@app.route('/uploadVideo', methods=['POST'])
def upload_video():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and file.filename.endswith('.mp4'):
        file_id = str(uuid.uuid4())
        if not os.path.exists(app.config['UPLOAD_FOLDER']+'/videos'):
            os.makedirs(app.config['UPLOAD_FOLDER']+'/videos')
        filename=os.path.join(app.config['UPLOAD_FOLDER']+'/videos', file_id + '.mp4')
        file.save(filename)
        return jsonify({'file_id': file_id})
    else:
        return jsonify({'error': 'Invalid file format'}), 400
    
@app.route('/uploadImage', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and file.filename.endswith('.png'):
        file_id = str(uuid.uuid4())
        if not os.path.exists(app.config['UPLOAD_FOLDER']+'/images'):
            os.makedirs(app.config['UPLOAD_FOLDER']+'/images')
        filename=os.path.join(app.config['UPLOAD_FOLDER']+'/images', file_id + '.png')
        file.save(filename)
    else:
        return jsonify({'error': 'Invalid file format'}), 400
    return jsonify({'file_id': file_id})

@app.route('/submit', methods=['POST'])
def get_submit():
    video_id = request.form.get('videoId')
    prompt_type = request.form.get('promptType')
    prompt = request.form.get('promptContent')
    email = request.form.get('email')
    image_id = request.form.get('imageId') if prompt_type == 'imagePrompt' else None

    if not prompt or not prompt_type:
        return jsonify({'error': 'No prompt content provided'}), 400
    elif prompt_type == 'imagePrompt':
        if not image_id: 
            return jsonify({'error': 'No image file provided'}), 400
        else:
            connection=get_db_connection()
            try:
                with connection.cursor() as cursor:
                    sql = "INSERT INTO request (VideoID, PromptType, PromptContent, Email, Image, UploadTime) VALUES (%s, %s, %s, %s, %s, %s)"
                    cursor.execute(sql, (video_id, prompt_type, prompt, email, image_id, datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
                    connection.commit()
            finally:
                connection.close()
    else:
        connection=get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = "INSERT INTO request (VideoID, PromptType, PromptContent, Email, UploadTime) VALUES (%s, %s, %s, %s, %s)"
                cursor.execute(sql, (video_id, prompt_type, prompt, email, datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
                connection.commit()
        finally:
            connection.close()
    return jsonify({'message': 'Submit successful'}), 200

if __name__ == '__main__':
    app.run(debug=True)