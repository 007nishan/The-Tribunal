import paramiko
import shutil
import os
import time

def deploy():
    host = "192.168.1.150"
    user = "nishan"
    password = "6WKW5_3w2w5121"
    
    local_dir = r"c:\Users\NISHAN\Desktop\Test Folder\The Tribunal"
    parent_dir = os.path.dirname(local_dir)
    zip_name = "the_tribunal.zip"
    zip_path = os.path.join(parent_dir, zip_name)
    
    print(f"Creating ZIP archive of {local_dir}...")
    if os.path.exists(zip_path):
        os.remove(zip_path)
    shutil.make_archive(zip_path.replace(".zip", ""), 'zip', local_dir)
    
    print(f"Connecting to {user}@{host} via SSH...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, username=user, password=password, timeout=20)
    
    print("Uploading ZIP archive...")
    sftp = ssh.open_sftp()
    remote_zip = f"/home/{user}/{zip_name}"
    sftp.put(zip_path, remote_zip)
    sftp.close()
    
    remote_dest = f"/home/{user}/the_tribunal"
    commands = [
        f"mkdir -p {remote_dest}",
        f"unzip -o {remote_zip} -d {remote_dest}",
        f"fuser -k 5000/tcp || true", # Kill old server (The Bench) on port 5000
    ]
    
    print("Extracting and killing old server...")
    for cmd in commands:
        ssh.exec_command(cmd)
        time.sleep(2)
        
    monitor_script = """
import subprocess
import time
import requests
import os

TOKEN = "8571904781:AAEhaViQiEihWOHShd0a0ywJ0BMufSh13p8"
CHAT_ID = "8687680759"

def send_telegram(msg):
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    requests.get(url, params={"chat_id": CHAT_ID, "text": msg}, timeout=10)

def check_process(name, restart_cmd):
    res = subprocess.run("ps aux | grep [" + name[0] + "]" + name[1:], shell=True, capture_output=True, text=True)
    if name not in res.stdout:
        subprocess.run(restart_cmd, shell=True)
        return False
    return True

# 1. Check Flask App -> Start The Tribunal Server
flask_restart = "cd /home/nishan/the_tribunal && python3 -m venv venv && source venv/bin/activate && pip install flask flask-sqlalchemy && nohup python app.py > app_log.txt 2>&1 &"
app_was_running = check_process("app.py", flask_restart)

# 2. Check Tunnel for Tribunal Server
tunnel_restart = "nohup /home/nishan/cloudflared tunnel --url http://127.0.0.1:5000 > /home/nishan/tunnel.log 2>&1 &"
tunnel_was_running = check_process("cloudflared tunnel --url http://127.0.0.1:5000", tunnel_restart)

# 3. Check Tunnel for Portfolio 
portfolio_tunnel_restart = "nohup /home/nishan/cloudflared tunnel --url http://127.0.0.1:80 > /home/nishan/tunnel_portfolio.log 2>&1 &"
portfolio_was_running = check_process("cloudflared tunnel --url http://127.0.0.1:80", portfolio_tunnel_restart)

def get_url(log_path):
    import re
    print(f"Polling {log_path} for active URL...")
    for _ in range(25):
        try:
            with open(log_path, 'r') as f:
                log = f.read()
            match = re.search(r'(https://[a-zA-Z0-9-]+\.trycloudflare\.com)', log)
            if match:
                return match.group(1)
        except Exception: pass
        time.sleep(3)
    return None

tribunal_url = get_url('/home/nishan/tunnel.log')
if tribunal_url:
    send_telegram(f"⚖️ **The Tribunal URL:**\\n{tribunal_url}")

port_url = get_url('/home/nishan/tunnel_portfolio.log')
if port_url:
    send_telegram(f"🎨 **Portfolio URL:**\\n{port_url}")

send_telegram("✅ **Hourly Automation Triggered**")
"""
    
    print("Writing new Telegram monitor bot script...")
    sftp = ssh.open_sftp()
    with sftp.open("/home/nishan/monitor_tunnels.py", "w") as f:
        f.write(monitor_script)
    sftp.close()
    
    print("Restarting cloudflared tunnels to trigger telegram message...")
    ssh.exec_command("pkill -9 -f 'cloudflared'")
    time.sleep(2)
    ssh.exec_command("rm -f /home/nishan/tunnel.log /home/nishan/tunnel_portfolio.log")
    
    stdin, stdout, stderr = ssh.exec_command("python3 /home/nishan/monitor_tunnels.py")
    out = stdout.read().decode('utf-8')
    err = stderr.read().decode('utf-8')
    
    print("--- Remote Monitor Output ---")
    print(out)
    if err:
        print("--- Errors ---")
        print(err)

    ssh.close()
    print("Deployment to nishan server complete!")

if __name__ == "__main__":
    deploy()
