from datetime import datetime
from pathlib import Path


BACKUP_DIR = Path(__file__).parent / "backups"


def backup_device(device):
    """
    Create a simulated running-config backup.
    Later this can be replaced with a real Netmiko SSH connection.
    """

    BACKUP_DIR.mkdir(exist_ok=True)

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

    filename = f"{device['name']}_{timestamp}.cfg"
    filepath = BACKUP_DIR / filename

    simulated_config = f"""
!
! NexusOps Configuration Backup
! Device: {device['name']}
! IP: {device['host']}
! Generated: {timestamp}
!
hostname {device['name']}
!
interface GigabitEthernet0/0
 ip address {device['host']} 255.255.255.0
 no shutdown
!
ip domain-name nexusops.local
ip ssh version 2
!
end
"""

    filepath.write_text(simulated_config.strip(), encoding="utf-8")

    return {
        "success": True,
        "device": device["name"],
        "host": device["host"],
        "backup_file": filename,
        "timestamp": timestamp,
        "mode": "simulation"
    }