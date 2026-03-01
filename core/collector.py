import time
import os
from collections import deque
from watchdog.events import FileSystemEventHandler

event_buffer = deque()

IGNORE_FILES = {"detection_output.json"}

class MonitorHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if not event.is_directory:
            if os.path.basename(event.src_path) in IGNORE_FILES:
                return
            event_buffer.append((time.time(), "modified", event.src_path))

    def on_created(self, event):
        if not event.is_directory:
            if os.path.basename(event.src_path) in IGNORE_FILES:
                return
            event_buffer.append((time.time(), "created", event.src_path))

    def on_deleted(self, event):
        if not event.is_directory:
            if os.path.basename(event.src_path) in IGNORE_FILES:
                return
            event_buffer.append((time.time(), "deleted", event.src_path))

def get_buffer():
    return event_buffer