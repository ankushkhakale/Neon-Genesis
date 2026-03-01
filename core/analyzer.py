import os
import time
from collections import Counter
from entropy import calculate_entropy

WINDOW_SIZE = 5

def analyze(event_buffer_snapshot):

    modified = 0
    created = 0
    deleted = 0

    unique_dirs = set()
    extension_counter = Counter()

    entropy_values = []
    high_entropy_count = 0

    current_time = time.time()

    valid_events = [
        e for e in event_buffer_snapshot
        if current_time - e[0] <= WINDOW_SIZE
    ]

    for timestamp, event_type, path in valid_events:

        _, ext = os.path.splitext(path)
        if ext:
            extension_counter[ext] += 1

        unique_dirs.add(os.path.dirname(path))

        if event_type == "modified":
            modified += 1

            if os.path.exists(path):
                ent = calculate_entropy(path)
                entropy_values.append(ent)

                if ent > 7.5:
                    high_entropy_count += 1

        elif event_type == "created":
            created += 1

        elif event_type == "deleted":
            deleted += 1

    avg_entropy = (
        sum(entropy_values) / len(entropy_values)
        if entropy_values else 0
    )

    burst_rate = modified / WINDOW_SIZE

    dominant_extension = None
    dominance_ratio = 0

    if extension_counter:
        dominant_extension, count = extension_counter.most_common(1)[0]
        dominance_ratio = count / sum(extension_counter.values())

    encryption_density = (
        high_entropy_count / modified
        if modified > 0 else 0
    )

    return {
        "modified": modified,
        "created": created,
        "deleted": deleted,
        "unique_dirs": len(unique_dirs),
        "unique_extensions": len(extension_counter),
        "avg_entropy": round(avg_entropy, 2),
        "burst_rate": round(burst_rate, 2),
        "dominant_extension": dominant_extension,
        "extension_dominance": round(dominance_ratio, 2),
        "high_entropy_files": high_entropy_count,
        "encryption_density": round(encryption_density, 2)
    }
