from urllib import response

import requests
import json

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3"

def build_prompt(behavior_json):
    system_instruction = """You are a cybersecurity behavioral analysis engine. You have to evaluate structured system metrics for ransomware likelihood or with surety of a ransomware attack. 
    Respond ONLY in strict JSON format:
    {
    "risk_level": "LOW | MEDIUM | HIGH | CRITICAL",
    "confidence": 0-100,
    "recommended_action": "MONITOR | ALERT | MITIGATE | FREEZE PROCESS | SHUTDOWN",
    "reasoning": "Short explanation of why this action was recommended",
    }"""

    return system_instruction + "\n\nBehavioral Metrics:\n" + json.dumps(behavior_json, indent=2)

def call_ollama(behavior_json):
    prompt = build_prompt(behavior_json)
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False
        }
        timeout=5
    )
    response.raise_for_status()
    result = response.json()
    return result["response"]