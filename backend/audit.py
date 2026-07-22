import json
from pathlib import Path


TEMPLATE_FILE = Path(__file__).parent / "templates" / "router_baseline.txt"
STATE_FILE = Path(__file__).parent / "device_state.json"


def audit_device(device):
    """
    Simulates configuration compliance auditing.

    Compares the device configuration against
    the approved NexusOps baseline.
    """

    # Read baseline configuration
    baseline = TEMPLATE_FILE.read_text(
        encoding="utf-8"
    ).splitlines()

    baseline = [
        line.strip()
        for line in baseline
        if line.strip()
    ]

    # Simulated running configuration
    running_config = [
        f"hostname {device['name']}",
        "interface GigabitEthernet0/0",
        f"ip address {device['host']} 255.255.255.0",
        "no shutdown",
        "ip domain-name nexusops.local",
        "ip ssh version 2"
    ]

    # Read commands previously deployed to this device
    with open(STATE_FILE, "r", encoding="utf-8") as file:
        state = json.load(file)

    device_state = state.get(
        str(device["id"]),
        {"extra_commands": []}
    )

    # Add deployed commands to simulated running configuration
    running_config.extend(
        device_state["extra_commands"]
    )

    # Find missing baseline commands
    missing_commands = [
        command
        for command in baseline
        if command not in running_config
    ]

    # Calculate compliance percentage
    compliance_score = (
        round(
            (
                (len(baseline) - len(missing_commands))
                / len(baseline)
            ) * 100,
            2
        )
        if baseline
        else 100
    )

    return {
        "device": device["name"],
        "host": device["host"],
        "compliant": len(missing_commands) == 0,
        "compliance_score": compliance_score,
        "missing_commands": missing_commands,
        "baseline_rules": len(baseline),
        "mode": "simulation"
    }