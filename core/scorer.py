def calculate_risk(features):

    risk = 0

    # Rapid modification burst
    if features["burst_rate"] > 15:
        risk += 25

    # High entropy average
    if features["avg_entropy"] > 7.5:
        risk += 30

    # Many files encrypted (density)
    if features["encryption_density"] > 0.6:
        risk += 30

    # Extension takeover pattern
    if features["extension_dominance"] > 0.8 and features["unique_extensions"] <= 2:
        risk += 15

    # Multi-directory spread
    if features["unique_dirs"] > 3:
        risk += 10

    suspicious = risk >= 60

    return risk, suspicious
