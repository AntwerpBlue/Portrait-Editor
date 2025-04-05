import cv2
import os
import argparse

def generate_thumbnails(video_path, output_dir='thumbnails', num_thumbnails=5):
    """
    从视频中生成缩略图
    
    参数:
        video_path (str): 视频文件路径
        output_dir (str): 缩略图输出目录
        num_thumbnails (int): 要生成的缩略图数量
    """
    # 创建输出目录
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # 打开视频文件
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"无法打开视频文件: {video_path}")
        return
    
    # 获取视频总帧数和帧率
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    duration = total_frames / fps if fps > 0 else 0
    
    print(f"视频信息: {total_frames}帧, {fps:.2f}FPS, 时长: {duration:.2f}秒")
    
    # 计算要截取的帧位置
    frame_indices = [int(total_frames * i / (num_thumbnails + 1)) for i in range(1, num_thumbnails + 1)]
    
    # 遍历视频帧并保存缩略图
    saved_count = 0
    frame_count = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_count += 1
        
        if frame_count in frame_indices:
            # 生成缩略图文件名
            timestamp = frame_count / fps
            output_path = os.path.join(output_dir, f"thumbnail_{saved_count+1}_{timestamp:.1f}s.jpg")
            
            # 保存缩略图
            cv2.imwrite(output_path, frame)
            print(f"已保存缩略图: {output_path}")
            saved_count += 1
            
            if saved_count >= num_thumbnails:
                break
    
    cap.release()
    print(f"完成! 共生成 {saved_count} 张缩略图")

if __name__ == "__main__":
    # 设置命令行参数
    parser = argparse.ArgumentParser(description='从视频生成缩略图')
    parser.add_argument('video_path', help='输入视频文件路径')
    parser.add_argument('-o', '--output', default='thumbnails', help='输出目录 (默认: thumbnails)')
    parser.add_argument('-n', '--num', type=int, default=1, help='缩略图数量 (默认: 5)')
    
    args = parser.parse_args()
    
    # 调用函数生成缩略图
    generate_thumbnails(args.video_path, args.output, args.num)