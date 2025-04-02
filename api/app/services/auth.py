from ..models.user import User
from ..extensions import db, mail
from ..utils.email import send_verification_email

class AuthService:
    @staticmethod
    def register_user(data):
        # 验证数据
        if User.query.filter_by(email=data['email']).first():
            return {'error': 'Email already exists'}, 400
        
        # 创建用户
        user = User(
            username=data['username'],
            email=data['email']
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
        
        # 发送验证邮件
        send_verification_email(user.email)
        return {'message': 'User created'}, 201