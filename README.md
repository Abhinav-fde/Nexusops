<div align="center">

# NexusOps

### Network Automation & Configuration Compliance Platform

**Centralized device monitoring, drift detection, and automated remediation — built as a full-stack network operations dashboard.**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Status](https://img.shields.io/badge/Status-Simulation%20Mode-yellow?style=flat-square)]()
[![License](https://img.shields.io/badge/License-Educational%20%2F%20Portfolio-lightgrey?style=flat-square)]()

[Overview](#overview) • [Features](#key-features) • [Architecture](#architecture) • [API](#rest-api) • [Getting Started](#running-nexusops-locally) • [Roadmap](#roadmap)

</div>

<p align="center">
  <a href="https://nexusops-one.vercel.app">
    <img src="https://img.shields.io/badge/LIVE_DEMO-2ea44f?style=for-the-badge" alt="Live Demo" />
  </a>
  &nbsp;
  <a href="https://nexusops-api.onrender.com/docs">
    <img src="https://img.shields.io/badge/API_DOCUMENTATION-0969da?style=for-the-badge" alt="API Documentation" />
  </a>
</p>

---

## Overview

As a network grows, manually verifying configurations, catching drift, and keeping backups current stops scaling. Engineers end up doing detective work — diffing configurations by eye and manually identifying changes.

**NexusOps turns that process into an automation pipeline.** It centralizes device inventory, configuration auditing, baseline compliance, backups, and automated remediation behind a single operations dashboard — so configuration drift can be detected and corrected systematically.

> **Current status:** Simulation-based automation environment, fully functional end-to-end.  
> **Next milestone:** SSH integration with virtual Cisco IOS devices for real configuration retrieval and deployment.

---

## Screenshots

### Network Operations Dashboard

![NexusOps Dashboard](screenshots/nexus1.png)

### Device Fleet & Automation

![NexusOps Device Fleet](screenshots/nexusops2.png)

### Compliance & Backup Management

![NexusOps Compliance](screenshots/nexusops3.png)

---

## Automation Workflow

```text
Device Inventory
       │
       ▼
Configuration Audit
       │
       ▼
Baseline Comparison
       │
       ├──── Compliant ────────────► Monitoring
       │
       └──── Drift Detected
                    │
                    ▼
            Missing Commands
                    │
                    ▼
          Automated Remediation
                    │
                    ▼
             Re-Audit Device ──────► 100% Compliance
```

---

## Key Features

| Feature | Description |
|---|---|
| **Operations Dashboard** | Visibility into device inventory, availability, topology, compliance, and recent activity |
| **Compliance Engine** | Compares device configuration against an approved baseline and calculates a compliance score |
| **Drift Detection** | Detects configuration changes that violate the approved baseline |
| **Automated Remediation** | Identifies missing commands and deploys the required configuration |
| **Configuration Backups** | Generates timestamped per-device backups individually or in bulk |
| **Activity Tracking** | Records audits, deployments, and backup operations |
| **Device Search** | Filters devices by name, IP address, or platform |

### Compliance Engine

```text
Approved Baseline
        +
Device Configuration
        │
        ▼
Configuration Comparison
        │
        ├── Required commands present
        │
        └── Missing commands detected
                    │
                    ▼
              Compliance Score
```

### Drift Detection Example

```text
Router0

Before drift  → Compliance: 100%
Command removed from running-config
After audit   → Compliance: 80% | Status: ACTION REQUIRED
```

### Automated Remediation Example

```text
Audit
  ↓
Detect Missing Configuration
  ↓
Fix Configuration
  ↓
Deploy Required Commands
  ↓
Re-Audit
  ↓
100% Compliance
```

---

## Architecture

```text
┌──────────────────────────────────────────────┐
│                   NexusOps                   │
└──────────────────────────────────────────────┘

                  React + Vite
                       │
                       │ REST API
                       ▼
                FastAPI Backend
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
  Audit Engine    Backup Engine   Deploy Engine
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
               Device Abstraction
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
        Simulation Mode     Future Lab Mode
                                 │
                                 ▼
                          SSH / Netmiko
                                 │
                                 ▼
                          Network Devices
```

The network-operations layer is deliberately decoupled from the API layer. This allows the current **Simulation Mode** to be replaced with real SSH/Netmiko device communication without redesigning the audit, backup, or deployment engines.

---

## Tech Stack

<table>
<tr>
<td valign="top" width="33%">

**Frontend**

- React
- Vite
- JavaScript
- CSS
- Fetch API

</td>
<td valign="top" width="33%">

**Backend**

- Python
- FastAPI
- Pydantic
- Uvicorn

</td>
<td valign="top" width="33%">

**Automation — Current**

- Configuration baseline validation
- Simulated device state
- Compliance calculation
- Remediation workflow
- Backup workflow

**Automation — Planned**

- Netmiko
- SSH
- Cisco IOS
- Real `show running-config`
- Real configuration deployment

</td>
</tr>
</table>

---

## Project Structure

```text
NexusOps/
│
├── backend/
│   ├── app.py
│   ├── audit.py
│   ├── backup.py
│   ├── deploy.py
│   ├── activity.py
│   ├── config.py
│   ├── models.py
│   ├── ssh.py
│   ├── devices.json
│   ├── device_state.json
│   ├── requirements.txt
│   │
│   ├── templates/
│   │   └── router_baseline.txt
│   │
│   └── backups/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/
│   ├── nexus1.png
│   ├── nexusops2.png
│   └── nexusops3.png
│
├── .gitignore
└── README.md
```

---

## REST API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API information |
| `GET` | `/health` | Backend health check |
| `GET` | `/devices` | Retrieve network devices |
| `GET` | `/audit/{device_id}` | Audit a single device |
| `GET` | `/audit-all` | Audit all devices |
| `POST` | `/deploy/{device_id}` | Deploy configuration to a device |
| `POST` | `/backup/{device_id}` | Back up a single device |
| `POST` | `/backup-all` | Back up all devices |
| `GET` | `/activities` | Retrieve automation activity log |

Interactive API documentation is available through the deployed FastAPI Swagger interface.

---

## Running NexusOps Locally

### 1. Clone the Repository

```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
cd NexusOps
```

### 2. Backend Setup

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r backend/requirements.txt
```

Start the FastAPI server:

```bash
uvicorn backend.app:app --reload
```

| Service | URL |
|---|---|
| Backend | `http://127.0.0.1:8000` |
| API Documentation | `http://127.0.0.1:8000/docs` |

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Start the development server:

```bash
npm run dev
```

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |

---

## Example Compliance Workflow

A device baseline requires:

```text
ip domain-name nexusops.local
ip ssh version 2
service password-encryption
```

If a required command is missing, NexusOps identifies the configuration drift:

```text
Router0

Compliance: 80%
Missing configuration detected
```

The remediation workflow can then restore compliance:

```text
80% Compliance
      ↓
Configuration Fix
      ↓
Missing Command Applied
      ↓
Re-Audit
      ↓
100% Compliance
```

---

## Simulation Mode

The current build uses simulated device state so the complete automation architecture can be developed and demonstrated without requiring physical network hardware.

Simulation Mode currently supports:

- Device inventory
- Configuration auditing
- Configuration drift detection
- Compliance scoring
- Configuration deployment state
- Configuration backups
- Activity tracking

This allows the API and automation workflows to be validated independently before the SSH/Netmiko integration is introduced.

---

## Roadmap

### Phase 1 — Platform Foundation

- [x] React operations dashboard
- [x] FastAPI backend
- [x] Device inventory
- [x] Network topology visualization
- [x] Configuration baseline
- [x] Compliance engine
- [x] Configuration drift detection
- [x] Automated remediation workflow
- [x] Configuration backups
- [x] Activity tracking
- [x] Device search
- [x] Responsive mobile support
- [x] Frontend deployment
- [x] Backend API deployment

### Phase 2 — Real Network Integration

- [ ] Virtual Cisco IOS lab
- [ ] SSH device connectivity
- [ ] Netmiko integration
- [ ] Retrieve real `show running-config`
- [ ] Real-time device availability
- [ ] Deploy configurations through SSH
- [ ] Retrieve real configuration backups
- [ ] Post-remediation verification

### Phase 3 — Advanced Automation

- [ ] Configuration versioning
- [ ] Backup comparison and diff
- [ ] Role-based access control
- [ ] Scheduled compliance audits
- [ ] Multi-vendor device support
- [ ] NETCONF / RESTCONF integration

---

## Engineering Goals

NexusOps explores the intersection of:

**Network Engineering × Backend Engineering × Automation × DevOps**

Rather than treating network management as a collection of manual commands, NexusOps models network operations as programmable workflows exposed through a REST API and managed through a centralized dashboard.

The project focuses on separating the user interface, API, automation engines, and device communication layer so that the underlying network integration can evolve independently.

---

## Security

- Environment variables are excluded from version control.
- Production device credentials are not stored in the repository.
- Real-device integration will use environment-based credential management rather than hardcoded authentication.
- Device communication will be handled through secure SSH-based automation.

---

## Future Vision

The long-term goal is to evolve NexusOps from a simulation-backed platform into a device-integrated network operations system capable of executing the complete configuration lifecycle:

```text
Observe
   ↓
Audit
   ↓
Detect Drift
   ↓
Remediate
   ↓
Verify
   ↓
Backup
```

The target architecture is designed to eventually support multiple network devices and secure network automation protocols.

---

## Author

**Abhinav**  
B.Tech Computer Science & Engineering

Areas of interest: **AI, Backend Engineering, Network Automation, and Infrastructure Software**

---

## License

This project is currently intended for educational and portfolio purposes.