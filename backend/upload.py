from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pymysql
import uuid

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER='./videos'
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

@app.route('/upload', methods=['POST'])
def upload_video():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and file.filename.endswith('.mp4'):
        file_id = str(uuid.uuid4())
        filename=os.path.join(app.config['UPLOAD_FOLDER'], file_id + '.mp4')
        file.save(filename)

        connection=get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = "INSERT INTO videos (VideoID, VideoName) VALUES (%s, %s)"
                cursor.execute(sql, (file_id, filename))
                connection.commit()
        finally:
            connection.close()
        return jsonify({'file_id': file_id})
    else:
        return jsonify({'error': 'Invalid file format'}), 400

    
    

@app.route('/submit', methods=['POST'])
def get_submit():
    video_id= request.form.get('videoId')
    prompt_type= request.form.get('promptType')
    prompt= request.form.get('promptContent')
    email= request.form.get('email')
    image=request.files['image']
    return jsonify({'message': 'Submit successful'}), 200

if __name__ == '__main__':
    app.run(debug=True)