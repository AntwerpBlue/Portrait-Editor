import os
from .base_editor import BaseEditor
from .exceptions import EditorError
from flask import current_app as app

class PotraitGen(BaseEditor):
    def __init__(self, task_data):
        super().__init__(task_data)
        self.video_id = task_data.get('video_id','')
        self.output_dir = os.path.join(app.config['UPLOAD_FOLDER'],'result')
        os.makedirs(self.output_dir, exist_ok=True)
        self.input_path = os.path.join(app.config['UPLOAD_FOLDER'], 'video', self.video_id+'.mp4')

    def get_required_fields(self):
        req=['video_id', 'prompt_type', 'prompt_content']
        type=self.task_data.get('prompt_type','')
        if type =='imagePrompt':
            req.append('image_id')
        if type =='relightening':
            req.append('relightBG')
        return req
    
    def process(self,progress_callback=None):
        pass