def should_trigger_llm(statistical_score, soft_threshold=2.5):
    return statistical_score>=soft_threshold

def should_hard_freeze(statistical_score, hard_threshold=5):
    return statistical_score>=hard_threshold