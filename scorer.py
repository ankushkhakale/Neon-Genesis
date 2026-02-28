def calculate_risk(features):

    risk = 0

    # High burst
    if features["burst_rate"] > 15:
        risk += 30

    # High entropy (encryption signal)
    if features["avg_entropy"] > 7.5:
        risk += 40

    # Extension takeover
    if features["extension_dominance"] > 0.8 and features["unique_extensions"] <= 2:
        risk += 20

    # Multi-directory spread
    if features["unique_dirs"] > 3:
        risk += 10

    suspicious = risk >= 60

    return risk, suspicious