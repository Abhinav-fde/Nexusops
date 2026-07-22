import json
from datetime import datetime
from pathlib import Path


STATE_FILE = Path(__file__).parent / "device_state.json"


def deploy_config(device, commands):
    if not commands:
        return {
            "success": False,
            "device": device["name"],
            "message": "No configuration commands provided"
        }

    with open(STATE_FILE, "r", encoding="utf-8") as file:
        state = json.load(file)

    device_id = str(device["id"])

    if device_id not in state:
        state[device_id] = {"extra_commands": []}

    for command in commands:
        if command not in state[device_id]["extra_commands"]:
            state[device_id]["extra_commands"].append(command)

    with open(STATE_FILE, "w", encoding="utf-8") as file:
        json.dump(state, file, indent=2)

    return {
        "success": True,
        "device": device["name"],
        "host": device["host"],
        "commands_applied": commands,
        "command_count": len(commands),
        "timestamp": datetime.now().strftime("%Y-%m-%d_%H-%M-%S"),
        "mode": "simulation"
    }