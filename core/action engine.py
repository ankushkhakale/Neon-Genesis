import os 
import signal

def freeze_process(pid):
    try:
        os.kill(pid, signal.SIGSTOP)
        print(f"[ACTION] Process {pid} frozen.")
    except Exception as e:
        print(f"[ERROR] Could not freeze process: {e}")

def alert(decision):
    print("ALERT: Potential ransomware activity detected!")
    print(decision)

def execute_action(decision, pid = None):
    action = decision["recommended_action"]
    if action == "FREEZE_PROCESS" and pid is not None:
        freeze_process(pid)
    elif action == "ALERT":
        alert(decision)
    else:
        print("[MONITOR] No action taken.")