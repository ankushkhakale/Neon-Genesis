import json
from datetime import datetime
import shutil
import os

AI_PIPELINE_PATH = "/home/mohit/AI_Input/detection_output.json"
#note change this directory on windows this one is mine

def export_json(features, risk, suspicious):

    output = {
        "timestamp": datetime.now().isoformat(),
        **features,
        "risk_score": risk,
        "suspicious": suspicious
    }

    with open("detection_output.json", "w") as f:
        json.dump(output, f, indent=4)

    if suspicious:
        try:
            os.makedirs(os.path.dirname(AI_PIPELINE_PATH), exist_ok=True)
            shutil.copy("detection_output.json", AI_PIPELINE_PATH)
        except Exception as e:
            print(f"[Pipeline Error] {e}")
