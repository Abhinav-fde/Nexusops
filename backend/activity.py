from datetime import datetime
from pathlib import Path


LOG_DIR = Path(__file__).parent / "logs"
LOG_FILE = LOG_DIR / "activity.log"


def log_activity(action, device, status, details=""):
    LOG_DIR.mkdir(exist_ok=True)

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    line = (
        f"{timestamp} | "
        f"{action} | "
        f"{device} | "
        f"{status} | "
        f"{details}\n"
    )

    with open(LOG_FILE, "a", encoding="utf-8") as file:
        file.write(line)


def get_activities():
    if not LOG_FILE.exists():
        return []

    lines = LOG_FILE.read_text(
        encoding="utf-8"
    ).splitlines()

    # Return newest activity first
    return list(reversed(lines[-50:]))