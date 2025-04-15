from app import create_app
import os

# 从环境变量加载配置（生产环境推荐）
app = create_app(os.getenv('FLASK_CONFIG') or 'default')

if __name__ == '__main__':
    # 开发时直接运行
    app.run(debug=True)