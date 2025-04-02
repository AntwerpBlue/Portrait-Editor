from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_cors import CORS

jwt = JWTManager()
db = SQLAlchemy()
mail = Mail()
cors = CORS()