import time
from watchdog.observers import Observer
from collector import MonitorHandler, get_buffer
from analyzer import analyze
from scorer import calculate_risk
from exporter import export_json

MONITOR_PATH = "/home/mohit/TestingDirectory"

def main():

    observer = Observer()
    observer.schedule(MonitorHandler(), MONITOR_PATH, recursive=True)
    observer.start()

    print("Monitoring started...")

    try:
        while True:
            time.sleep(1)

            buffer = get_buffer()
            features = analyze(buffer)

            risk, suspicious = calculate_risk(features)

            print(features)
            print(f"Risk: {risk}, Suspicious: {suspicious}")

            export_json(features, risk, suspicious)

    except KeyboardInterrupt:
        observer.stop()

    observer.join()

if __name__ == "__main__":
    main()