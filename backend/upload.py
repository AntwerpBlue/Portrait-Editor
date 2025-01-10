from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import uuid

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:QAQ122133122wzc@localhost/portrait_editor'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

@app.route('/upload', methods=['POST'])
def upload_video():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and file.filename.endswith('.mp4'):
        file_id = str(uuid.uuid4())
        file.save(f'{file_id}.mp4')
        return jsonify({'file_id': file_id})
    else:
        return jsonify({'error': 'Invalid file format'}), 400
    

@app.route('/submit', methods=['POST'])
def get_submit():
    video_id= request.form.get('video_id')
    return jsonify({'message': 'Submit successful'}), 200

if __name__ == '__main__':
    app.run(debug=True)