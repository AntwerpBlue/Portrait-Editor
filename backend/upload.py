from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)

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
    
@app.route('/prompt', methods=['POST'])
def get_prompt():
    data=request.get_json()
    prompt_type=data.get('type')
    if prompt_type=='text':
        prompt=data.get('prompt')
        return jsonify({'prompt':prompt})


if __name__ == '__main__':
    app.run(debug=True)