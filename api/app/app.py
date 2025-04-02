from flask import Flask, request, jsonify, make_response
from flask_jwt_extended import (
    JWTManager, create_access_token, 
    jwt_required, get_jwt_identity
)
import jwt
from flask_cors import CORS
import os
import re
import pymysql
import pymysql.cursors
import uuid
from datetime import datetime, timedelta, timezone
from werkzeug.security import generate_password_hash,check_password_hash

import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app,
     resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "https://your-production-domain.com"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Authorization", "Content-Type"],
            "supports_credentials": True,  # 允许携带 Cookie
            "expose_headers": ["Set-Cookie"]
        }
    })



######配置信息不能硬编码在代码中，需要放到配置文件中#######

app.config['JWT_SECRET_KEY'] = '3fa85f64-5717-4562-b3fc-2c963f66afa6'  # 生产环境请使用更复杂的密钥
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_COOKIE_SECURE"] = True  # 仅 HTTPS
app.config["JWT_COOKIE_CSRF_PROTECT"] = True  # 启用 CSRF 保护
jwt_manager = JWTManager(app)
jwt_manager = JWTManager(app)

UPLOAD_FOLDER='./files'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

db_config={
    'host': 'localhost',
    'user': 'root',
    'password': 'QAQ122133122wzc',
    'database': 'portrait_editor',
    'cursorclass': pymysql.cursors.DictCursor
}

#############################################################################

def is_email_valid(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$'
    return re.match(pattern, email) is not None

def get_db_connection():
    return pymysql.connect(**db_config)


# 生成重置 Token（JWT 实现）
def generate_reset_token(email):
    return jwt.encode(
        {
            "email": email,
            "exp": datetime.now(timezone.utc) + timedelta(minutes=10)
        },
        app.config["JWT_SECRET_KEY"],
        algorithm="HS256"
    )

# 验证 Token
def verify_reset_token(token):
    try:
        data = jwt.decode(
            token,
            app.config["JWT_SECRET_KEY"],
            algorithms=["HS256"]
        )
        return data["email"]
    except:
        return None



@app.route('/api/register', methods=['POST'])
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
            cursor.execute('SELECT * FROM user WHERE Mail = %s', (mail,))
            user = cursor.fetchone()
            if user:
                return jsonify({'error': 'The mail has been registered'}), 400
            cursor.execute('SELECT COUNT(*) FROM user')
            id = cursor.fetchone()[0]
            hashed_password = generate_password_hash(password)
            cursor.execute('INSERT INTO user (Name, Password, UserID, Mail) VALUES (%s, %s, %s, %s)', (username, hashed_password, id+1, mail))
        conn.commit()
        return jsonify({'success': True, 'message': 'User registered successfully'}), 200
    except Exception as e:
        conn.rollback()
        app.logger.error(f"Registration error: {str(e)}")
        return jsonify({'success': False, 'error': 'Registration failed'}), 500
    finally:
        conn.close()


@app.route('/api/send-code', methods=['POST'])
def send_verification_code():
    data = request.get_json()
    email = data.get('email')
    username = data.get('username')
    flag= data.get('type')
    if not email or (flag == 'forget' and not username):
        return jsonify({'error': 'Missing required fields'}), 400
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if flag == 'forget':
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

    resp=make_response(jsonify({'message': 'Verification code sent', 'verification_code': verification_code}))

    if flag=='forget':
        token=generate_reset_token(email)
        resp.set_cookie(
            "reset_token",
            token,
            max_age=600,  # 10分钟
        )

    return resp

@app.route('/api/forget/reset', methods=['POST'])
def reset_password():
    token= request.cookies.get("reset_token") 
    data = request.get_json()
    new_password = data.get('new_password')

    if not token:
        return jsonify({"error": "Token 已过期"}), 401

    email = verify_reset_token(token)
    if not email:
        return jsonify({"error": "无效 Token"}), 401

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute('SELECT * FROM user WHERE Mail = %s', (email))
            user = cursor.fetchone()
            if not user:
                return jsonify({'error': 'User not found'}), 400
            hashed_password = generate_password_hash(new_password)
            cursor.execute('UPDATE user SET Password = %s WHERE Mail = %s', (hashed_password, email))
        conn.commit()
    finally:
        conn.close()

    resp = make_response(jsonify({"success": True}))
    resp.delete_cookie("reset_token")
    return resp

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # 验证输入
    if not username or not password:
        return jsonify({'success': False, 'message': '用户名和密码不能为空'}), 400

    conn = get_db_connection()
    with conn.cursor() as cursor:
        # 查找用户（支持用户名或邮箱登录）
        cursor.execute('SELECT * FROM user WHERE Name = %s', (username))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'success': False, 'message': '用户名或密码错误'}), 401

        # 验证密码
        if not check_password_hash(user['Password'], password):
            return jsonify({'success': False, 'message': '用户名或密码错误'}), 401
        return jsonify({'success': True, 'message': '登录成功', 'user': {'username': user['Name'], 'mail': user['Mail']}}), 200
    conn.close()

@app.route('/refresh-token', methods=['POST'])
@jwt_required(refresh=True)  # 只接受refresh token
def refresh_token():
    try:
        current_user = get_jwt_identity()
        new_token = create_access_token(identity=current_user)
        
        return jsonify({
            'success': True,
            'token': new_token,
            'user': current_user
        })
    except Exception as e:
        app.logger.error(f"Refresh token error: {str(e)}")
        return jsonify({'success': False, 'message': 'Token刷新失败'}), 401

@app.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({
        'success': True,
        'message': f'欢迎 {current_user["username"]}',
        'user': current_user
    })




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