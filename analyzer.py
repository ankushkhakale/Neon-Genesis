import os
import time
from collections import Counter
from entropy import calculate_entropy

WINDOW_SIZE = 5

def clean_old_events(event_buffer):
    current_time = time.time()
    while event_buffer and (current_time - event_buffer[0][0] > WINDOW_SIZE):
        event_buffer.popleft()

def analyze(event_buffer):
    clean_old_events(event_buffer)

    modified = 0
    created = 0
    deleted = 0

    unique_dirs = set()
    extension_counter = Counter()
    entropy_values = []

    for timestamp, event_type, path in event_buffer:

        _, ext = os.path.splitext(path)
        if ext:
            extension_counter[ext] += 1

        unique_dirs.add(os.path.dirname(path))

        if event_type == "modified":
            modified += 1
            if os.path.exists(path):
                entropy_values.append(calculate_entropy(path))

        elif event_type == "created":
            created += 1

        elif event_type == "deleted":
            deleted += 1

    avg_entropy = (
        sum(entropy_values) / len(entropy_values)
        if entropy_values else 0
    )

    burst_rate = modified / WINDOW_SIZE

    # Extension dominance detection
    dominant_extension = None
    dominance_ratio = 0

    if extension_counter:
        dominant_extension, count = extension_counter.most_common(1)[0]
        dominance_ratio = count / sum(extension_counter.values())

    return {
        "modified": modified,
        "created": created,
        "deleted": deleted,
        "unique_dirs": len(unique_dirs),
        "unique_extensions": len(extension_counter),
        "avg_entropy": round(avg_entropy, 2),
        "burst_rate": round(burst_rate, 2),
        "dominant_extension": dominant_extension,
        "extension_dominance": round(dominance_ratio, 2)
    }