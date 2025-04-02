import os
from werkzeug.utils import secure_filename
from ..config import Config

def save_uploaded_file(file, file_id):
    filename = secure_filename(f"{file_id}_{file.filename}")
    save_path = os.path.join(Config.UPLOAD_FOLDER, filename)
    file.save(save_path)
    return save_path