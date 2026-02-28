import json

ALLOWED_RISKS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
ALLOWED_ACTIONS = ["MONITOR", "ALERT", "MITIGATE", "FREEZE PROCESS", "SHUTDOWN"]

def validate_llm_response(raw_response):
    try:
        decision = json.loads(raw_response)

        if decision["risk_level"] not in ALLOWED_RISKS:
            raise ValueError("Invalid risk level")
        
        if decision["recommended_action"] not in ALLOWED_ACTIONS:
            raise ValueError("Invalid recommended action")
        
        if not isinstance(decision["confidence"], int):
            raise ValueError("Confidence must be an integer")
        
        return decision
    except Exception:
        return fallback_decision()

def fallback_decision():
    return{
        "risk_level": "HIGH",
        "confidence": 70,
        "recommended_action": "FREEZE PROCESS",
        "reasoning": "Fallback triggered due to invalid LLM response or processing error. Defaulting to a conservative decision to ensure system safety."
    }