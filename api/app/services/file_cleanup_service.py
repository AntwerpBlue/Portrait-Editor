from datetime import datetime
from flask import current_app
import os
from ..database import with_transaction

@with_transaction
def cleanup_expired_files(app, conn=None, cursor=None):
    """清理过期的图片和视频文件"""
    
    # 清理图片
    cursor.execute(
        """
        SELECT * FROM image 
        WHERE ExpireTime <= %s 
        AND UsedProjectID IS NULL
        """,(datetime.now(),)
    )
    expired_images = cursor.fetchall()
    # 清理视频

    cursor.execute(
        """
        SELECT * FROM video 
        WHERE ExpireTime <= %s 
        AND UsedProjectID IS NULL
        """,(datetime.now(),)
    )
    expired_videos = cursor.fetchall()

    deleted_files = []
    
    # 删除图片文件和记录
    for img in expired_images:
        file_path=os.path.join(current_app.config['UPLOAD_FOLDER'],"image",img['imageName'])
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
            cursor.execute(
                """
                DELETE FROM image 
                WHERE imageName = %s
                """,(img['imageName'],)
            )
            deleted_files.append(f"Image {img['imageName']}")
        except Exception as e:
            current_app.logger.error(
                f"文件删除失败 {img['imageName']}（已回滚当前操作）: {str(e)}",
                exc_info=True
            )
    
    # 删除视频文件和记录
    for vid in expired_videos:
        file_path=os.path.join(current_app.config['UPLOAD_FOLDER'],"video",vid['videoName'])
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
            cursor.execute(
                """
                DELETE FROM video 
                WHERE videoName = %s
                """,(vid['videoName'],)
            )
            deleted_files.append(f"Video {vid['videoName']}")
        except Exception as e:
            current_app.logger.error(
                f"文件删除失败 {vid['videoName']}（已回滚当前操作）: {str(e)}",
                exc_info=True
            )

    if deleted_files:
            print(f"已删除 {len(deleted_files)} 个过期文件：")
            for file in deleted_files:
                print(f"- {file} ")
    return deleted_files