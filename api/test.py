import os
import subprocess
import sys
sys.path.append('~/data/PortraitGen-code')
sys.path.append('~/data/SMPLXTracking')


def run_bash(cmd):
    print(cmd)
    process=subprocess.Popen(cmd,
                            stdout=subprocess.PIPE,
                            stderr=subprocess.STDOUT,
                            shell=True,
                            universal_newlines=True,
                            executable='/usr/bin/bash' )
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

cmd_text=f"""
source {os.path.expanduser('/data/oren/miniforge3/etc/profile.d/conda.sh')} &&  
conda activate portraitgen && \
cd {os.path.expanduser('~/data/PortraitGen-code')} && \
bash run_edit_ip2p.sh \
    '0' \
    'a1117f49-297e-4627-a2bd-04ef43ff5319' \
    'turn him into lego style' \
    '/data/oren/Thesis_Portrait_Editor/api/app/static/result/5b4b74d6-0507-4fc0-9c22-e027bab69bbd/'
"""
cmd_text = ' '.join(line.strip() for line in cmd_text.splitlines() if line.strip())

run_bash(cmd_text)