import math

def calculate_entropy(file_path):
    try:
        with open(file_path, "rb") as f:
            data = f.read(2048)
            if not data:
                return 0

            freq = [data.count(b) / len(data) for b in set(data)]
            return -sum(p * math.log2(p) for p in freq)
    except:
        return 0