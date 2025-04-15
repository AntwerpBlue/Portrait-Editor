from redis import Redis
from rq import Worker, Queue, Connection
from flask import current_app

if __name__ == '__main__':
    redis_conn = Redis(current_app.config.REDIS_CONFIG)
    with Connection(redis_conn):
        worker = Worker([Queue(current_app.config.REDIS_CONFIG['queue_name'])])
        worker.work()