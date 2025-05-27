import subprocess
import re

def get_gpus_with_memory(min_memory_mb=20000):
    """
    返回可用显存大于指定值的 GPU 序号列表
    :param min_memory_mb: 最小要求的可用显存(MB)，默认为20000MB
    :return: 可用 GPU 序号列表，如 [0, 1]
    """
    try:
        # 运行 nvidia-smi 查询 GPU 显存信息
        cmd = [
            "nvidia-smi",
            "--query-gpu=index,memory.total,memory.used,utilization.gpu",
            "--format=csv,noheader,nounits"
        ]
        output = subprocess.check_output(cmd, encoding="utf-8")
        
        available_gpus = []
        for line in output.strip().split("\n"):
            if not line:
                continue
            gpu_id, total_mem, used_mem, util = map(int, re.split(r",\s*", line.strip()))
            free_mem = total_mem - used_mem
            if free_mem >= min_memory_mb and util < 70:
                available_gpus.append(gpu_id)

        return available_gpus
    
    except subprocess.CalledProcessError as e:
        print(f"执行 nvidia-smi 失败: {e}")
        return []
    except Exception as e:
        print(f"处理 GPU 信息时出错: {e}")
        return []