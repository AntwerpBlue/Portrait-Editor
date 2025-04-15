import jwt
from datetime import datetime, timedelta, timezone
from flask import current_app

def generate_reset_token(email):
    return jwt.encode(
        {
            "email": email,
            "exp": datetime.now(timezone.utc) + timedelta(minutes=10)
        },
        current_app.config["JWT_SECRET_KEY"],
        algorithm="HS256"
    )

def verify_reset_token(token):
    try:
        data = jwt.decode(
            token,
            current_app.config["JWT_SECRET_KEY"],
            algorithms=["HS256"]
        )
        return data["email"]
    except:
        return None