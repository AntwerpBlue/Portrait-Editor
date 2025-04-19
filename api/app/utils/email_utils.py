import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app

def send_verification_email(email, username=None, reset=False):
    verification_code = str(random.randint(100000, 999999))
    
    msg = MIMEMultipart()
    msg['From'] = current_app.config['MAIL_USERNAME']
    msg['To'] = email
    msg['Subject'] = 'Your Verification Code'
    
    body = f'Your verification code is: {verification_code}'
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        server = smtplib.SMTP(current_app.config['MAIL_SERVER'], current_app.config['MAIL_PORT'])
        server.starttls()
        server.login(current_app.config['MAIL_USERNAME'], current_app.config['MAIL_PASSWORD'])
        server.sendmail(current_app.config['MAIL_USERNAME'], email, msg.as_string())
        server.quit()
        return verification_code
    except Exception as e:
        current_app.logger.error(f"Email sending failed: {str(e)}")
        return None
    
def send_result_email(email, project_id, result):
    msg = MIMEMultipart()
    msg['From'] = current_app.config['MAIL_USERNAME']
    msg['To'] = email
    msg['Subject'] = 'Editor Result'
    
    body = f'Your project {project_id} has been processed. The result is: {result}. You can also check the result on the website.'
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        server = smtplib.SMTP(current_app.config['MAIL_SERVER'], current_app.config['MAIL_PORT'])
        server.starttls()
        server.login(current_app.config['MAIL_USERNAME'], current_app.config['MAIL_PASSWORD'])
        server.sendmail(current_app.config['MAIL_USERNAME'], email, msg.as_string())
        server.quit()
    except Exception as e:
        current_app.logger.error(f"Email sending failed: {str(e)}")
        return None