from flask import Blueprint, request, jsonify
from ..services.auth_service import AuthService
from ..utils.auth import generate_reset_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    return AuthService.register_user(data)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    return AuthService.authenticate_user(data)

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    email = request.json.get('email')
    token = generate_reset_token(email)
    return AuthService.send_reset_email(email, token)