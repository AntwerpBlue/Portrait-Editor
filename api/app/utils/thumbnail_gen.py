import cv2
import os

def get_thumbnail(video_id,upload_folder):
    video_path=os.path.join(upload_folder, 'result', "short_"+video_id+'.mp4')
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"无法打开视频文件 {video_path}")
    
    success, frame = cap.read()
    cap.release()
    
    if not success:
        raise RuntimeError("读取视频帧失败")
    os.makedirs(os.path.join(upload_folder, 'thumbnail'), exist_ok=True)
    output_path=os.path.join(upload_folder, 'thumbnail', video_id+'.jpg')
    cv2.imwrite(output_path, frame)
    print(f"thumbnail has saved at {output_path}")
    return output_path
