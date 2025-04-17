from flask import Blueprint, jsonify, current_app, Response
from redis import Redis
import json

task_bp = Blueprint('task', __name__)

@task_bp.route('/status/<task_id>', methods=['GET'])
def get_task_status(task_id):
    redis = current_app.extensions['redis']
    task_data = redis.hgetall(f"task:{task_id}")
    if not task_data:
        return jsonify({"error": "Task not found"}), 404
    
    # 转换字节串为字符串
    decoded_data = {
        key.decode(): value.decode() 
        for key, value in task_data.items()
    }
    
    # 检查是否正在处理
    is_processing = redis.sismember("set:processing", task_id)
    decoded_data['is_processing'] = bool(is_processing)
    
    return jsonify(decoded_data)

@task_bp.route('/progress/<task_id>', methods=['GET'])
def get_task_progress(task_id):
    redis = current_app.extensions['redis'].redis
    # 创建发布/订阅监听
    pubsub = redis.pubsub()
    pubsub.subscribe(f"task:{task_id}")
    
    # 获取当前状态
    initial_data = redis.hgetall(f"task:{task_id}")
    if not initial_data:
        return jsonify({"error": "Task not found"}), 404
    
    # 返回SSE流
    def event_stream():
        yield f"data: {json.dumps(initial_data)}\n\n"
        
        for message in pubsub.listen():
            if message['type'] == 'message':
                yield f"data: {message['data'].decode()}\n\n"
    
    return Response(event_stream(), mimetype="text/event-stream")