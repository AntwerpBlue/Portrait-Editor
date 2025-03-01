from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re
import pymysql
import uuid
from datetime import datetime
from werkzeug.security import generate_password_hash

import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

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

def is_email_valid(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$'
    return re.match(pattern, email) is not None

def get_db_connection():
    return pymysql.connect(**db_config)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    mail = data.get('mail')
    if not username or not password or not mail:
        return jsonify({'error': 'Missing required fields'}), 400
    if not is_email_valid(mail):
        return jsonify({'error': 'Invalid email format'}), 400
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute('SELECT * FROM user WHERE Mail = %s', (mail))
            user = cursor.fetchone()
            if user:
                return jsonify({'error': 'The mail has been registered'}), 400
            cursor.execute('SELECT COUNT(*) FROM user')
            id = cursor.fetchone()[0]
            hashed_password = generate_password_hash(password)
            cursor.execute('INSERT INTO user (Name, Password, UserID, Mail) VALUES (%s, %s, %s, %s)', (username, hashed_password, id+1, mail))
        conn.commit()
    finally:
        conn.close()
    return jsonify({'message': 'User registered successfully'}), 200


@app.route('/send-verification-code', methods=['POST'])
def send_verification_code():
    data = request.get_json()
    email = data.get('email')
    username = data.get('username')
    if not email or not username:
        return jsonify({'error': 'Missing required fields'}), 400
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute('SELECT * FROM user WHERE Mail = %s AND Name = %s', (email, username))
            user = cursor.fetchone()
            if not user:
                return jsonify({'error': 'The mail and username do not match'}), 400
    finally:
        conn.close()

    sender_account='ustc3dvttttest@163.com'
    sender_pass='DEfLZ39hhXn6CxuQ'
    verification_code = str(random.randint(100000, 999999))

    msg = MIMEMultipart()
    msg['From'] = sender_account
    msg['To'] = email
    msg['Subject'] = 'Your Verification Code'

    body = f'Your verification code is: {verification_code}'
    msg.attach(MIMEText(body, 'plain'))
    server = smtplib.SMTP('smtp.163.com', 25)
    server.starttls()
    server.login(sender_account, sender_pass)
    server.sendmail(sender_account, email, msg.as_string())
    server.quit()

    return jsonify({'message': 'Verification code sent', 'verification_code': verification_code}), 200

@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    userId= data.get('userId')
    email = data.get('email')
    new_password = data.get('new_password')

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute('SELECT * FROM user WHERE Mail = %s AND UserID = %s', (email, userId))
            user = cursor.fetchone()
            if not user:
                return jsonify({'error': 'User not found'}), 400
            hashed_password = generate_password_hash(new_password)
            cursor.execute('UPDATE user SET Password = %s WHERE Mail = %s AND UserID = %s', (hashed_password, email, userId))
        conn.commit()
    finally:
        conn.close()


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