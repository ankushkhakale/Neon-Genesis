import json
from datetime import datetime
import shutil

AI_PIPELINE_PATH = "/home/mohit/AI_Input/detection_output.json"

def export_json(features, risk, suspicious):

    output = {
        "timestamp": datetime.now().isoformat(),
        **features,
        "risk_score": risk,
        "suspicious": suspicious
    }

    with open("detection_output.json", "w") as f:
        json.dump(output, f, indent=4)

    # Automatically send to AI pipeline if suspicious
    if suspicious:
        shutil.copy("detection_output.json", AI_PIPELINE_PATH)