import os
from .base_editor import BaseEditor
from datetime import datetime
import time
import shutil
from pathlib import Path
from ..utils.gpu_utils import get_gpus_with_memory
from flask import current_app as app
import sys
sys.path.append('~/data/PortraitGen-code')
sys.path.append('~/data/SMPLXTracking')
import subprocess

def run_bash(cmd_list):
    cmd=" ".join(cmd_list) if type(cmd_list)==list else ' '.join(line.strip() for line in cmd_list.splitlines() if line.strip())
    execut = None if type(cmd_list)==list else '/usr/bin/bash'
    process=subprocess.Popen(cmd,
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            shell=True,
                            executable=execut,
                            universal_newlines=True )
    while True:
        output = process.stdout.readline()
        if output == '' and process.poll() is not None:
            break
        if output:
            print(output.strip())
    
    # 读取剩余的输出（如果有）
    remaining_output, _ = process.communicate()
    if remaining_output:
        print(remaining_output.strip())

class PortraitGen(BaseEditor):
    def __init__(self, task_data):
        self.video_id = task_data.get('video_id','')
        self.project_id = task_data.get('project_id','')
        self.prompt_type= task_data.get('prompt_type')
        super().__init__(task_data)
        self.output_dir = os.path.join(app.config['UPLOAD_FOLDER'],'result', self.project_id)
        self.img_dir= os.path.join(app.config['UPLOAD_FOLDER'], 'image')
        self.input_path = os.path.join(app.config['UPLOAD_FOLDER'], 'video', self.video_id+'.mp4')
        self.preprocess_path = os.path.join(app.config['UPLOAD_FOLDER'], 'preprocess', self.video_id)
        
    #def get_required_fields(self):
    #    req=['video_id', 'prompt_type', 'prompt_content']
    #    prompt_type=self.task_data.get('prompt_type','')
    #    if prompt_type =='imagePrompt':
    #       req.append('image_id')
    #    if prompt_type =='relightening':
    #        req.append('relightBG')
    #    return req
    
    def process(self,progress_callback=None):
        print('Preprocessing...')
        cmd_preprocess=[
            "conda", "run", "-n", "portrait_magic_cu121",
            "python", "../SMPLXTracking/main_video.py",
            "--video_path", self.input_path,
            "--output_dir", os.path.join(self.preprocess_path,'gaussian')
        ]
        run_bash(cmd_preprocess)
        print('Preprocess complete!')
        
        while True:
            available_gpus = get_gpus_with_memory()
            if available_gpus:
                available_gpu = available_gpus[0]  # 使用第一个可用GPU
                break
            else:
                current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                print(f"{current_time} - 没有可用GPU，等待1分钟后重试...")
                time.sleep(60)  # 等待60秒
        
        print('Start reconstruction...')
        cmd_recon=f"""
            source {os.path.expanduser('/data/oren/miniforge3/etc/profile.d/conda.sh')} && 
            conda activate portraitgen && \
            cd ../PortraitGen-code && \
            bash run_recon.sh \
                    {available_gpu} \
                    '{self.video_id}' \
        """
        run_bash(cmd_recon)
        print('Reconstruction complete!')

        print('Start editing...')
        if self.prompt_type == 'textPrompt':
            cmd_text=f"""
            source {os.path.expanduser('/data/oren/miniforge3/etc/profile.d/conda.sh')} && 
            conda activate portraitgen && \
            cd ~/data/PortraitGen-code && \
            bash run_edit_ip2p.sh \
                {available_gpu} \
                {self.task_data.get('video_id')} \
                '{self.task_data.get('prompt_content')}' \
                {self.output_dir}
            """
            run_bash(cmd_text)
            print("Edit complete! Check result at "+self.output_dir)
        elif self.prompt_type == 'imagePrompt':
            if self.task_data.get('prompt_content')=="styleTransfer":
                cmd_image=f"""
                    source {os.path.expanduser('/data/oren/miniforge3/etc/profile.d/conda.sh')} && 
                    conda activate portraitgen && \
                    bash ../PortraitGen-code/run_edit_style.sh \
                        {available_gpu} \
                        {self.task_data.get('video_id','')} \
                        '{os.path.join(self.img_dir,self.task_data.get('image_id',''))}' \
                        {self.output_dir}
                """

                subprocess.run(cmd_image, check=True)
                print("Edit complete! Check result at "+self.output_dir)
            elif self.task_data.get('prompt_content')=="virtualTryOn":
                cmd_image=f"""
                    source {os.path.expanduser('/data/oren/miniforge3/etc/profile.d/conda.sh')} && 
                    conda activate portraitgen && \
                    bash ../PortraitGen-code/run_edit_anydoor.sh \
                        {available_gpu} \
                        {self.task_data.get('video_id','')} \
                        '{os.path.join(self.img_dir,self.task_data.get('image_id',''))}' \
                        {self.output_dir}
                """
        
                subprocess.run(cmd_image, check=True)
                print("Edit complete! Check result at "+self.output_dir)
        elif self.prompt_type == 'relightening':
            cmd_relight=f"""
                source {os.path.expanduser('/data/oren/miniforge3/etc/profile.d/conda.sh')} && 
                conda activate portraitgen && \
                bash ../PortraitGen-code/run_edit_relight.sh \
                    {available_gpu} \
                    {self.task_data.get('video_id','')} \
                    {self.task_data.get('relightBG','')} \
                    '{self.task_data.get('prompt_content','')}' \
                    {self.output_dir}
            """

            subprocess.run(cmd_relight, check=True)
            print("Edit complete! Check result at "+self.output_dir)
        
        result_lib=Path(self.output_dir)
        gaussian_lib=result_lib/'gaussian_scene_fea_dev'
        recon_src=gaussian_lib/'recon.mp4'
        recon_dst=result_lib.parent / f'{self.project_id}.mp4'

        if recon_src.exists():
            shutil.move(str(recon_src), str(recon_dst))
            print(f"Moved {recon_src} to {recon_dst}")
            if result_lib.exists():
                shutil.rmtree(result_lib)
                print(f"Deleted intermediate files in {result_lib}")
        else:
            print(f"Warning: {recon_src} not found!")
        
        
