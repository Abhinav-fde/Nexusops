import json
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from audit import audit_device
from pydantic import BaseModel
from deploy import deploy_config
from fastapi import FastAPI, HTTPException
from backup import backup_device
from activity import get_activities, log_activity

BASE_DIR = Path(__file__).resolve().parent
DEVICES_FILE = BASE_DIR / "devices.json"

app = FastAPI(
    title="NexusOps API",
    description="Enterprise Network Automation & Configuration Management Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConfigRequest(BaseModel):
    commands: list[str]


@app.get("/")
def home():
    return {
        "project": "NexusOps",
        "status": "Running",
        "version": "1.0.0"
    }


@app.get("/health")
def health():
    return {
        "status": "Healthy"
    }


@app.get("/devices")
def get_devices():
    with open(DEVICES_FILE, "r", encoding="utf-8") as file:
        devices = json.load(file)

    safe_devices = []

    for device in devices:
        safe_devices.append({
            "id": device["id"],
            "name": device["name"],
            "device_type": device["device_type"],
            "host": device["host"],
            "status": device["status"]
        })

    return safe_devices
@app.post("/backup/{device_id}")
def create_backup(device_id: int):

    with open(DEVICES_FILE, "r", encoding="utf-8") as file:
        devices = json.load(file)

    device = next(
        (device for device in devices if device["id"] == device_id),
        None
    )

    if device is None:
        raise HTTPException(
            status_code=404,
            detail="Device not found"
        )

    result = backup_device(device)

    log_activity(
        "BACKUP",
         device["name"],
         "SUCCESS",
         result.get("backup_file", "")
    )
    return result
@app.post("/backup-all")
def backup_all_devices():
    with open(DEVICES_FILE, "r", encoding="utf-8") as file:
        devices = json.load(file)

    results = []

    for device in devices:
        try:
            result = backup_device(device)
            results.append(result)
        except Exception as error:
            results.append({
                "success": False,
                "device": device["name"],
                "error": str(error)
            })

    successful = sum(1 for result in results if result["success"])

    return {
        "success": successful == len(devices),
        "total_devices": len(devices),
        "successful_backups": successful,
        "failed_backups": len(devices) - successful,
        "results": results
    }
@app.post("/deploy/{device_id}")
def deploy_to_device(device_id: int, request: ConfigRequest):

    with open(DEVICES_FILE, "r", encoding="utf-8") as file:
        devices = json.load(file)

    device = next(
        (device for device in devices if device["id"] == device_id),
        None
    )

    if device is None:
        raise HTTPException(
            status_code=404,
            detail="Device not found"
        )

    result = deploy_config(device, request.commands)

    log_activity(
        "DEPLOY",
         device["name"],
        "SUCCESS",
        f"{len(request.commands)} command(s) applied"
    )

    return result

@app.get("/audit/{device_id}")
def audit_network_device(device_id: int):
    with open(DEVICES_FILE, "r", encoding="utf-8") as file:
        devices = json.load(file)

    device = next(
        (device for device in devices if device["id"] == device_id),
        None
    )

    if device is None:
        raise HTTPException(
            status_code=404,
            detail="Device not found"
        )
    result = audit_device(device)

    log_activity(
       "AUDIT",
        device["name"],
        "SUCCESS",
        f"{result['compliance_score']}% compliant"
    )

    return result
@app.get("/audit-all")
def audit_all_devices():

    with open(DEVICES_FILE, "r", encoding="utf-8") as file:
        devices = json.load(file)

    results = []

    for device in devices:
        result = audit_device(device)
        results.append(result)

    compliant_devices = sum(
        1 for result in results if result["compliant"]
    )

    non_compliant_devices = len(results) - compliant_devices

    average_compliance = (
        round(
            sum(result["compliance_score"] for result in results)
            / len(results),
            2
        )
        if results
        else 100
    )

    return {
        "total_devices": len(results),
        "compliant_devices": compliant_devices,
        "non_compliant_devices": non_compliant_devices,
        "average_compliance_score": average_compliance,
        "devices": results
    }
@app.get("/activities")
def activities():
    return {
        "activities": get_activities()
    }