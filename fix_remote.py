import paramiko
import time

def fix_remote():
    host = "192.168.1.150"
    user = "nishan"
    password = "6WKW5_3w2w5121"
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, username=user, password=password, timeout=10)
    
    print("Deleting old database schemas...")
    ssh.exec_command("rm -rf /home/nishan/the_tribunal/instance /home/nishan/the_tribunal/tribunal.db")
    time.sleep(1)
    
    print("Checking app.py logs...")
    _, stdout, _ = ssh.exec_command("tail -n 20 /home/nishan/the_tribunal/app_log.txt")
    print(stdout.read().decode('utf-8'))
    
    print("Checking tunnel logs...")
    _, stdout, _ = ssh.exec_command("cat /home/nishan/tunnel.log")
    print(stdout.read().decode('utf-8'))
    
    ssh.close()

if __name__ == "__main__":
    fix_remote()
