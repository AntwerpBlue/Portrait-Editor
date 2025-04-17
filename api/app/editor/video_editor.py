import os
from moviepy import VideoFileClip
from .base_editor import BaseEditor
from .exceptions import EditorError
from flask import current_app as app

class AlgorithmEditor(BaseEditor):
    """视频编辑器实现"""
    
    def __init__(self, task_data):
        super().__init__(task_data)
        self.video_id = task_data.get('video_id', '')
        self.output_dir = task_data.get('output_dir', os.path.join(app.config['UPLOAD_FOLDER'],'result'))
        os.makedirs(self.output_dir, exist_ok=True)
        self.input_path = os.path.join(app.config['UPLOAD_FOLDER'], 'video', self.video_id)

    def get_required_fields(self):
        return ['video_id', 'output_dir']
    
    def process(self, progress_callback=None):
        try:
            if progress_callback:
                progress_callback(0, "Starting video processing")
            
            clip = VideoFileClip(self.input_path)
            duration = min(10.0, clip.duration)
            short_clip = clip.subclip(0, duration)
            
            output_path = os.path.join(
                self.output_dir, 
                f"short_{os.path.basename(self.input_path)}"
            )
            
            if progress_callback:
                progress_callback(30, "Cutting video")
            
            short_clip.write_videofile(
                output_path,
                codec='libx264',
                audio_codec='aac',
                threads=4,
                logger=None
            )
            
            if progress_callback:
                progress_callback(90, "Finalizing output")
            
            clip.close()
            short_clip.close()
            
            if progress_callback:
                progress_callback(100, "Processing complete")
            
            return output_path
            
        except Exception as e:
            if progress_callback:
                progress_callback(-1, f"Error: {str(e)}")
            raise EditorError(f"Video processing failed: {str(e)}")