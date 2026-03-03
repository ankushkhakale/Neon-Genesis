"""
PROMETHEUS — Gemini AI Analyst
Uses google.genai SDK with gemini-2.5-flash.
Built-in exponential-backoff retry for 429 quota errors.
"""

import json
import logging
import time
from datetime import datetime
from typing import Any, Dict, List, Tuple

log = logging.getLogger("neon_genesis")
GEMINI_MODEL = "gemini-2.5-flash"

SYSTEM_INSTRUCTION = (
    "You are PROMETHEUS, an expert cybersecurity AI analyst specializing in "
    "ransomware detection and behavioral analysis on Linux systems. "
    "Analyze real-time telemetry from a behavioral detection engine. "
    "Always respond in JSON with the exact fields requested. Be concise and factual."
)


def _client(api_key: str):
    from google import genai
    return genai.Client(api_key=api_key)


def _strip_json(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        parts = text.split("```")
        text = parts[1] if len(parts) > 1 else text
        if text.startswith("json"):
            text = text[4:]
    return text.strip()


def _generate_with_retry(client, prompt: str, max_output_tokens: int = 768, retries: int = 3) -> str:
    """Call Gemini with exponential-backoff retry on 429 quota errors."""
    from google.genai import types
    delay = 15  # start with 15s on 429 (per-minute quota resets in 60s)
    for attempt in range(retries):
        try:
            resp = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(temperature=0.3, max_output_tokens=max_output_tokens),
            )
            return resp.text
        except Exception as e:
            err_str = str(e)
            if "429" in err_str and attempt < retries - 1:
                log.warning(f"[AI] Rate limited (attempt {attempt+1}/{retries}) — waiting {delay}s…")
                time.sleep(delay)
                delay = min(delay * 2, 60)  # cap at 60s
                continue
            raise
    raise RuntimeError("Max retries exceeded on Gemini API")


def analyze_threat(
    api_key: str,
    risk_score: int,
    threat_state: str,
    burst_rate: float,
    avg_entropy: float,
    features: Dict[str, Any],
    processes: List[Dict[str, Any]],
    monitor_path: str = "",
) -> Dict[str, Any]:
    try:
        client = _client(api_key)
        top_procs = sorted(processes, key=lambda p: p.get("cpu", 0), reverse=True)[:5]
        proc_summary = "\n".join(
            f"  - PID {p.get('pid')} | {p.get('binary','?')} | CPU {p.get('cpu',0):.1f}% | user {p.get('username','?')}"
            for p in top_procs
        ) or "  (none)"

        prompt = f"""{SYSTEM_INSTRUCTION}

Analyze this Linux system telemetry for ransomware. Respond ONLY with valid JSON, no markdown fences.

TELEMETRY:
- Risk Score: {risk_score}/100
- Threat State: {threat_state}
- File Burst Rate: {burst_rate:.2f} modifications/sec
- Average File Entropy: {avg_entropy:.3f} (>7.0 may indicate encryption)
- Monitored Path: {monitor_path or '/home/user/data'}
- Features: {json.dumps(features)}

TOP PROCESSES (by CPU):
{proc_summary}

JSON schema (respond ONLY with this, no other text):
{{"verdict":"<RANSOMWARE|SUSPICIOUS|BENIGN|UNKNOWN>","confidence":<0-100>,"reason":"<one sentence>","recommendation":"<specific action>","indicators":["<indicator>"]}}"""

        text = _generate_with_retry(client, prompt, max_output_tokens=512)
        result = json.loads(_strip_json(text))
        result.update({"timestamp": datetime.now().isoformat(), "risk_score": risk_score,
                        "threat_state": threat_state, "model": GEMINI_MODEL})
        log.info(f"[AI] Threat verdict: {result.get('verdict')} ({result.get('confidence')}%)")
        return result
    except Exception as e:
        log.error(f"[AI] analyze_threat error: {e}")
        return {"verdict": "UNKNOWN", "confidence": 0, "reason": str(e)[:120],
                "recommendation": "Review manually.", "indicators": [],
                "timestamp": datetime.now().isoformat(), "risk_score": risk_score,
                "threat_state": threat_state, "model": GEMINI_MODEL, "error": str(e)}


def analyze_process(
    api_key: str, pid: int, binary: str, username: str, cpu: float,
    mem_kb: int, status: str, cmdline: str = "",
    open_files: List[str] = None, connections: List[str] = None,
) -> Dict[str, Any]:
    try:
        client = _client(api_key)
        files_str = "\n".join(f"  {f}" for f in (open_files or [])[:20]) or "  (none)"
        conns_str = "\n".join(f"  {c}" for c in (connections or [])[:10]) or "  (none)"

        prompt = f"""{SYSTEM_INSTRUCTION}

Analyze this Linux process for ransomware behavior. Respond ONLY with valid JSON, no markdown fences.

PROCESS:
- PID: {pid}, Binary: {binary}, User: {username}
- CPU: {cpu:.1f}%, Memory: {mem_kb // 1024} MB, Status: {status}
- Command: {cmdline or '(not available)'}

OPEN FILES (sample):
{files_str}

CONNECTIONS:
{conns_str}

JSON schema (respond ONLY with this, no other text):
{{"verdict":"<RANSOMWARE|SUSPICIOUS|BENIGN|UNKNOWN>","confidence":<0-100>,"reason":"<one sentence>","recommendation":"<action>","process_type":"<e.g. Python script>","indicators":["<indicator>"]}}"""

        text = _generate_with_retry(client, prompt, max_output_tokens=512)
        result = json.loads(_strip_json(text))
        result.update({"timestamp": datetime.now().isoformat(), "pid": pid,
                        "binary": binary, "model": GEMINI_MODEL})
        log.info(f"[AI] Process verdict PID {pid} ({binary}): {result.get('verdict')}")
        return result
    except Exception as e:
        log.error(f"[AI] analyze_process PID {pid} error: {e}")
        return {"verdict": "UNKNOWN", "confidence": 0, "reason": str(e)[:120],
                "recommendation": "Review manually.", "process_type": "Unknown",
                "indicators": [], "timestamp": datetime.now().isoformat(),
                "pid": pid, "binary": binary, "model": GEMINI_MODEL, "error": str(e)}


def generate_incident_summary(
    api_key: str,
    events: List[Dict[str, Any]],
    metrics: Dict[str, Any],
    verdicts: List[Dict[str, Any]],
    monitor_path: str = "",
) -> Dict[str, Any]:
    try:
        client = _client(api_key)
        prompt = f"""You are a professional cybersecurity incident reporter.
Generate a structured markdown incident report. Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

METRICS:
{json.dumps(metrics, indent=2)}

MONITORED DIRECTORY: {monitor_path}

TIMELINE EVENTS (last 20):
{json.dumps(events[:20], indent=2)}

AI VERDICTS (last 8):
{json.dumps(verdicts[:8], indent=2)}

Write a professional report with these sections:
## Incident Summary
## Key Indicators
## AI Verdicts Summary
## Timeline
## Recommended Actions
## Severity Assessment: [CRITICAL|HIGH|MEDIUM|LOW|INFO]

Output ONLY raw markdown, no code fences."""

        text = _generate_with_retry(client, prompt, max_output_tokens=1500)
        severity = "MEDIUM"
        for level in ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]:
            if level in text.upper():
                severity = level
                break
        return {"summary_markdown": text,
                "title": f"Prometheus Incident Report — {datetime.now().strftime('%Y-%m-%d %H:%M')}",
                "severity": severity, "timestamp": datetime.now().isoformat(), "model": GEMINI_MODEL}
    except Exception as e:
        log.error(f"[AI] generate_incident_summary error: {e}")
        return {"summary_markdown": f"## AI Summary Unavailable\n\nError: {e}",
                "title": "Incident Report (AI Unavailable)", "severity": "UNKNOWN",
                "timestamp": datetime.now().isoformat(), "model": GEMINI_MODEL, "error": str(e)}


def test_ai_connection(api_key: str) -> Tuple[bool, str]:
    """Quick connectivity test — single call, no retry."""
    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=api_key)
        resp = client.models.generate_content(
            model=GEMINI_MODEL,
            contents='Reply with only the words: PROMETHEUS AI ready',
            config=types.GenerateContentConfig(max_output_tokens=20),
        )
        return True, f"{GEMINI_MODEL} · {resp.text.strip()[:60]}"
    except Exception as e:
        msg = str(e)
        # Friendly message for common errors
        if "429" in msg:
            return False, f"Rate limited (quota) — AI will retry automatically. Model: {GEMINI_MODEL}"
        if "404" in msg:
            return False, f"Model not found: {GEMINI_MODEL}. Check API key permissions."
        return False, msg[:200]
