from flask import Blueprint, request, jsonify, make_response
from ..services import auth_service
from ..utils.auth_utils import generate_reset_token, verify_reset_token
from ..utils.email_utils import send_verification_email
from ..exceptions import InvalidRequest

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    try:
        username = data['username']
        password = data['password']
        email = data['mail']
    except KeyError:
        raise InvalidRequest("Missing required fields")
    
    try:
        user_id = auth_service.register_user(username, password, email)
        return jsonify({
            'success': True,
            'user_id': user_id,
            'message': 'Success!'
        }), 201
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    try:
        username = data['username']
        password = data['password']
    except KeyError:
        raise InvalidRequest("Missing username or password")
    
    user = auth_service.verify_login(username, password)
    if not user:
        return jsonify({
            'success': False,
            'error': 'Invalid credentials'
        }), 401
    
    return jsonify({
        'success': True,
        'user': user
    })

@auth_bp.route('/forget/reset', methods=['POST'])
def reset():
    token= request.cookies.get("reset_token") 
    data = request.get_json()
    new_password = data.get('new_password')

    if not token:
        return jsonify({"error": "Token 已过期"}), 401

    email = verify_reset_token(token)
    if not email:
        return jsonify({"error": "无效 Token"}), 401
    auth_service.reset_password(email, new_password)
    resp = make_response(jsonify({"success": True, "message": "reset successfully"}))
    resp.delete_cookie("reset_token")
    return resp


@auth_bp.route('/send-code', methods=['POST'])
def send_verification_code():
    data = request.get_json()
    email = data.get('email')
    username = data.get('username')
    flag= data.get('type')
    if not email or (flag == 'forget' and not username):
        return jsonify({'error': 'Missing required fields'}), 400
    if flag=='register' or auth_service.initiate_password_reset(email, username):
        veri_code=send_verification_email(email)
        resp=make_response(jsonify({'message': 'Verification code sent', 'verification_code': veri_code}))
    else:
        resp=make_response(jsonify({'error': 'User not found'}), 404)
    if flag=='forget':
        token=generate_reset_token(email)
        resp.set_cookie(
            "reset_token",
            token,
            max_age=600,  # 10分钟
        )
    return resp
