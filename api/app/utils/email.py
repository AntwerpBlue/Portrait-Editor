from flask_mail import Message
from ..extensions import mail

def send_verification_email(to_email):
    msg = Message("Verify Your Email",
                  sender="noreply@example.com",
                  recipients=[to_email])
    msg.body = "Please click the link to verify your email"
    mail.send(msg)