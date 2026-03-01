"""
PROMETHEUS — Behavioral Ransomware Detection Console
FastAPI Backend Wrapper
Wraps core/ detection engine — core files are READ-ONLY, never modified.
"""

import asyncio
import json
import logging
import os
import sys
import time
import zipfile
import signal
from collections import deque
from datetime import datetime
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Optional, Dict, Any, List

import psutil
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ─── Path Bootstrap ────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).parent.parent.resolve()
CORE_DIR = PROJECT_ROOT / "core"
LOGS_DIR = PROJECT_ROOT / "logs"
BACKUPS_DIR = PROJECT_ROOT / "backups"
CONFIG_PATH = PROJECT_ROOT / "config.json"

# Add core/ to sys.path so we can import without touching core files
if str(CORE_DIR) not in sys.path:
    sys.path.insert(0, str(CORE_DIR))

LOGS_DIR.mkdir(exist_ok=True)
BACKUPS_DIR.mkdir(exist_ok=True)

# ─── Rotating Logger ────────────────────────────────────────────────────────────
def _build_logger() -> logging.Logger:
    logger = logging.getLogger("neon_genesis")
    if logger.handlers:
        return logger
    logger.setLevel(logging.INFO)
    handler = RotatingFileHandler(
        LOGS_DIR / "system.log",
        maxBytes=5 * 1024 * 1024,  # 5 MB
        backupCount=3,
        encoding="utf-8",
    )
    handler.setFormatter(
        logging.Formatter("%(asctime)s | %(message)s", datefmt="%Y-%m-%dT%H:%M:%S")
    )
    logger.addHandler(handler)
    stream = logging.StreamHandler(sys.stdout)
    stream.setFormatter(logging.Formatter("[%(levelname)s] %(message)s"))
    logger.addHandler(stream)
    return logger

log = _build_logger()

# ─── Config ─────────────────────────────────────────────────────────────────────
DEFAULT_CONFIG: Dict[str, Any] = {
    "monitor_path": "/home/mohit/TestingDirectory",
    "risk_threshold": 60,
    "entropy_threshold": 7.5,
    "auto_containment": True,
}

def load_config() -> Dict[str, Any]:
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH) as f:
                cfg = json.load(f)
            return {**DEFAULT_CONFIG, **cfg}
        except Exception as e:
            log.warning(f"Config load failed: {e} — using defaults")
    return dict(DEFAULT_CONFIG)

def save_config(cfg: Dict[str, Any]) -> None:
    with open(CONFIG_PATH, "w") as f:
        json.dump(cfg, f, indent=2)

# ─── Threat State Machine ────────────────────────────────────────────────────────
STATES = ["NORMAL", "WATCH", "SUSPICIOUS", "CONTAINING", "LOCKDOWN"]

def compute_state(risk: int, cfg: Dict[str, Any]) -> str:
    threshold = cfg.get("risk_threshold", 60)
    if risk < 20:
        return "NORMAL"
    elif risk < threshold * 0.5:
        return "WATCH"
    elif risk < threshold:
        return "SUSPICIOUS"
    elif risk < threshold + 20:
        return "CONTAINING"
    else:
        return "LOCKDOWN"

# ─── In-Memory State ─────────────────────────────────────────────────────────────
scan_active = False
scan_task: Optional[asyncio.Task] = None
containment_triggered = False
last_state = "NORMAL"

metrics_store: Dict[str, Any] = {
    "risk_score": 0,
    "threat_state": "NORMAL",
    "burst_rate": 0.0,
    "avg_entropy": 0.0,
    "suspicious_processes": [],
    "features": {},
}

timeline_events: deque = deque(maxlen=500)
threat_log_entries: deque = deque(maxlen=500)

# ─── Core Engine Lazy Imports ─────────────────────────────────────────────────────
_collector_mod = None
_analyzer_mod = None
_scorer_mod = None
_exporter_mod = None
_observer = None

def _load_core():
    global _collector_mod, _analyzer_mod, _scorer_mod, _exporter_mod
    if _collector_mod is None:
        try:
            import collector as _c
            import analyzer as _a
            import scorer as _s
            import exporter as _e
            _collector_mod = _c
            _analyzer_mod = _a
            _scorer_mod = _s
            _exporter_mod = _e
            log.info("Core engine modules loaded.")
        except ImportError as exc:
            log.error(f"Core import failed: {exc}")
            raise RuntimeError(f"Core engine unavailable: {exc}")

# ─── Process Intelligence ────────────────────────────────────────────────────────
PROTECTED_NAMES = {"python", "python3", "node", "electron", "uvicorn", "systemd", "init"}
PROTECTED_MIN_PID = 2

def get_suspicious_processes(risk: int) -> List[Dict[str, Any]]:
    """Return processes with elevated CPU that may indicate ransomware activity."""
    try:
        procs = []
        for proc in psutil.process_iter(["pid", "name", "cpu_percent", "status"]):
            try:
                info = proc.info
                cpu = proc.cpu_percent(interval=None)
                if cpu > 5.0 or risk > 50:
                    state = "SUSPICIOUS" if (cpu > 20 or risk > 70) else "WATCH"
                    procs.append({
                        "pid": info["pid"],
                        "binary": info["name"] or "unknown",
                        "cpu": round(cpu, 1),
                        "risk": min(int(cpu * 1.5), 100),
                        "state": state,
                        "containment": "ACTIVE" if state == "SUSPICIOUS" and risk > 70 else "NONE",
                    })
                    if len(procs) >= 30:
                        break
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        return sorted(procs, key=lambda p: p["cpu"], reverse=True)
    except Exception as e:
        log.error(f"Process scan error: {e}")
        return []

# ─── Scan Loop ───────────────────────────────────────────────────────────────────
async def _scan_loop():
    global scan_active, containment_triggered, last_state, _observer
    _load_core()
    cfg = load_config()
    monitor_path = cfg.get("monitor_path", DEFAULT_CONFIG["monitor_path"])

    # Validate / create monitor path (Fedora/SELinux safe)
    try:
        Path(monitor_path).mkdir(parents=True, exist_ok=True)
        log.info(f"Monitor path ready: {monitor_path}")
    except PermissionError as e:
        log.error(f"SELinux/permission denied creating monitor path: {e}")
        raise HTTPException(status_code=403, detail=f"Monitor path permission denied: {e}")
    except OSError as e:
        log.error(f"Cannot create monitor path: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    # Start watchdog observer
    try:
        from watchdog.observers import Observer
        _observer = Observer()
        _observer.schedule(_collector_mod.MonitorHandler(), monitor_path, recursive=True)
        _observer.start()
        log.info("Watchdog observer started.")
    except Exception as e:
        log.error(f"Watchdog start failed: {e}")
        raise

    containment_triggered = False
    last_state = "NORMAL"

    try:
        while scan_active:
            await asyncio.sleep(1)
            cfg = load_config()
            buffer = list(_collector_mod.get_buffer())
            features = _analyzer_mod.analyze(buffer)
            risk, suspicious = _scorer_mod.calculate_risk(features)
            state = compute_state(risk, cfg)

            procs = get_suspicious_processes(risk)
            metrics_store["risk_score"] = risk
            metrics_store["threat_state"] = state
            metrics_store["burst_rate"] = features.get("burst_rate", 0.0)
            metrics_store["avg_entropy"] = features.get("avg_entropy", 0.0)
            metrics_store["suspicious_processes"] = procs
            metrics_store["features"] = features

            # Timeline event on state change or periodic escalation
            if state != last_state or risk > 50:
                evt = {
                    "timestamp": datetime.now().isoformat(),
                    "state": state,
                    "risk": risk,
                    "entropy": features.get("avg_entropy", 0),
                    "burst": features.get("burst_rate", 0),
                    "action": "STATE_CHANGE" if state != last_state else "ESCALATION",
                }
                timeline_events.appendleft(evt)
                log_line = (
                    f"{evt['timestamp']} | {state} | risk={risk} "
                    f"| entropy={evt['entropy']} | burst={evt['burst']} | {evt['action']}"
                )
                log.info(log_line)
                threat_log_entries.appendleft(log_line)

            # Containment — trigger once per state transition into CONTAINING/LOCKDOWN
            if cfg.get("auto_containment", True):
                if state in ("CONTAINING", "LOCKDOWN") and not containment_triggered:
                    containment_triggered = True
                    log.warning(f"AUTO-CONTAINMENT TRIGGERED — state={state} risk={risk}")
                    timeline_events.appendleft({
                        "timestamp": datetime.now().isoformat(),
                        "state": state,
                        "risk": risk,
                        "entropy": features.get("avg_entropy", 0),
                        "burst": features.get("burst_rate", 0),
                        "action": "AUTO_CONTAINMENT",
                    })

            # Reset containment trigger when back to safe state
            if state in ("NORMAL", "WATCH"):
                containment_triggered = False

            last_state = state

            try:
                _exporter_mod.export_json(features, risk, suspicious)
            except Exception as e:
                log.warning(f"Exporter error: {e}")

    except asyncio.CancelledError:
        log.info("Scan loop cancelled.")
    except Exception as e:
        log.error(f"Scan loop error: {e}")
    finally:
        scan_active = False
        if _observer:
            try:
                _observer.stop()
                _observer.join(timeout=3)
            except Exception:
                pass
            _observer = None
        log.info("Watchdog observer stopped.")

# ─── FastAPI App ─────────────────────────────────────────────────────────────────
app = FastAPI(title="Prometheus Detection API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Scan Endpoints ──────────────────────────────────────────────────────────────
@app.post("/scan/start")
async def scan_start():
    global scan_active, scan_task
    if scan_active:
        raise HTTPException(status_code=409, detail="Scan already running.")
    scan_active = True
    scan_task = asyncio.create_task(_scan_loop())
    log.info("Scan started via API.")
    return {"status": "started"}

@app.post("/scan/stop")
async def scan_stop():
    global scan_active, scan_task
    if not scan_active:
        raise HTTPException(status_code=409, detail="No scan running.")
    scan_active = False
    if scan_task:
        scan_task.cancel()
        try:
            await asyncio.wait_for(asyncio.shield(scan_task), timeout=5)
        except (asyncio.CancelledError, asyncio.TimeoutError):
            pass
        scan_task = None
    log.info("Scan stopped via API.")
    return {"status": "stopped"}

@app.get("/scan/status")
async def scan_status():
    return {
        "active": scan_active,
        "threat_state": metrics_store["threat_state"],
        "risk_score": metrics_store["risk_score"],
    }

# ─── Metrics Endpoint ───────────────────────────────────────────────────────────
@app.get("/metrics")
async def get_metrics():
    return {
        "risk_score": metrics_store["risk_score"],
        "threat_state": metrics_store["threat_state"],
        "burst_rate": metrics_store["burst_rate"],
        "avg_entropy": metrics_store["avg_entropy"],
        "suspicious_processes": metrics_store["suspicious_processes"],
        "features": metrics_store["features"],
    }

# ─── Logs Endpoint ──────────────────────────────────────────────────────────────
@app.get("/logs/recent")
async def get_logs(limit: int = 200):
    entries = list(threat_log_entries)[:limit]
    return {"logs": entries, "count": len(entries)}

# ─── Config Endpoints ────────────────────────────────────────────────────────────
class ConfigUpdate(BaseModel):
    monitor_path: Optional[str] = None
    risk_threshold: Optional[int] = None
    entropy_threshold: Optional[float] = None
    auto_containment: Optional[bool] = None

@app.get("/config")
async def get_config():
    return load_config()

@app.post("/config/update")
async def update_config(body: ConfigUpdate):
    cfg = load_config()
    updates = body.model_dump(exclude_none=True)
    # Sanitize monitor_path
    if "monitor_path" in updates:
        p = Path(updates["monitor_path"])
        try:
            p.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid monitor path: {e}")
    cfg.update(updates)
    save_config(cfg)
    log.info(f"Config updated: {updates}")
    return {"status": "ok", "config": cfg}

# ─── Process Endpoints ───────────────────────────────────────────────────────────
@app.get("/processes")
async def list_processes():
    return {"processes": metrics_store["suspicious_processes"]}

class PidAction(BaseModel):
    pid: int

def _validate_pid(pid: int):
    if pid <= PROTECTED_MIN_PID:
        raise HTTPException(status_code=403, detail="Cannot act on system-critical PID.")
    if pid == os.getpid():
        raise HTTPException(status_code=403, detail="Cannot act on self.")
    try:
        proc = psutil.Process(pid)
        name = proc.name().lower()
        for prot in PROTECTED_NAMES:
            if prot in name:
                raise HTTPException(status_code=403, detail=f"Protected process: {name}")
        return proc
    except psutil.NoSuchProcess:
        raise HTTPException(status_code=404, detail="Process not found.")

@app.post("/processes/suspend")
async def suspend_process(body: PidAction):
    proc = _validate_pid(body.pid)
    try:
        proc.suspend()
        log.warning(f"Process {body.pid} ({proc.name()}) suspended.")
        return {"status": "suspended", "pid": body.pid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/processes/kill")
async def kill_process(body: PidAction):
    proc = _validate_pid(body.pid)
    try:
        name = proc.name()
        proc.kill()
        log.warning(f"Process {body.pid} ({name}) killed.")
        return {"status": "killed", "pid": body.pid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── Timeline Endpoint ───────────────────────────────────────────────────────────
@app.get("/timeline")
async def get_timeline(limit: int = 100):
    events = list(timeline_events)[:limit]
    return {"events": events, "count": len(events)}

# ─── Backup Endpoints ────────────────────────────────────────────────────────────
BACKUP_META_PATH = BACKUPS_DIR / "metadata.json"
MAX_BACKUP_WARN_BYTES = 100 * 1024 * 1024  # 100 MB

def load_backup_meta() -> List[Dict]:
    if BACKUP_META_PATH.exists():
        try:
            with open(BACKUP_META_PATH) as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_backup_meta(meta: List[Dict]):
    with open(BACKUP_META_PATH, "w") as f:
        json.dump(meta, f, indent=2)

@app.get("/backup/list")
async def backup_list():
    return {"backups": load_backup_meta()}

class BackupCreateRequest(BaseModel):
    path: str
    name: Optional[str] = None

@app.post("/backup/create")
async def backup_create(body: BackupCreateRequest):
    source = Path(body.path)
    if not source.exists():
        raise HTTPException(status_code=404, detail=f"Path not found: {body.path}")

    try:
        # Warn if large
        total_size = sum(f.stat().st_size for f in source.rglob("*") if f.is_file())
        warn = total_size > MAX_BACKUP_WARN_BYTES
    except Exception:
        total_size = 0
        warn = False

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_name = body.name or f"snapshot_{ts}"
    zip_path = BACKUPS_DIR / f"{backup_name}.zip"

    try:
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            if source.is_dir():
                for file in source.rglob("*"):
                    if file.is_file():
                        zf.write(file, file.relative_to(source.parent))
            else:
                zf.write(source, source.name)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=f"SELinux/permission error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    zip_size = zip_path.stat().st_size
    entry = {
        "id": backup_name,
        "name": backup_name,
        "source": str(source),
        "zip_path": str(zip_path),
        "created_at": datetime.now().isoformat(),
        "size_bytes": zip_size,
        "size_human": f"{zip_size / 1024:.1f} KB" if zip_size < 1024*1024 else f"{zip_size / 1024 / 1024:.2f} MB",
        "warn_large": warn,
    }
    meta = load_backup_meta()
    meta.insert(0, entry)
    save_backup_meta(meta)
    log.info(f"Backup created: {backup_name} ({entry['size_human']})")
    return {"status": "created", "backup": entry}

@app.post("/backup/restore/{backup_id}")
async def backup_restore(backup_id: str):
    meta = load_backup_meta()
    entry = next((b for b in meta if b["id"] == backup_id), None)
    if not entry:
        raise HTTPException(status_code=404, detail="Backup not found.")

    zip_path = Path(entry["zip_path"])
    if not zip_path.exists():
        raise HTTPException(status_code=404, detail="Backup zip file missing.")

    restore_dir = Path(entry["source"])
    try:
        restore_dir.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(zip_path, "r") as zf:
            zf.extractall(restore_dir.parent)
        log.info(f"Backup restored: {backup_id} → {restore_dir}")
        return {"status": "restored", "path": str(restore_dir)}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=f"SELinux/permission error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── Health ──────────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "time": datetime.now().isoformat()}
