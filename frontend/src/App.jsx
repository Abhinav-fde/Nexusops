import { useEffect, useState } from "react";
import "./App.css";

const API = "https://nexusops-api.onrender.com";

function App() {
  const [devices, setDevices] = useState([]);
  const [audit, setAudit] = useState(null);
  const [message, setMessage] = useState("Ready");
  const [activities, setActivities] = useState([]);
  const [currentTime, setCurrentTime] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");

  const loadDashboard = async () => {
    console.log("NexusOps API:", API);
    try {
      const [deviceRes, auditRes, activityRes] = await Promise.all([
        fetch(`${API}/devices`),
        fetch(`${API}/audit-all`),
        fetch(`${API}/activities`),
      ]);

      if (!deviceRes.ok || !auditRes.ok || !activityRes.ok) {
        throw new Error("API request failed");
      }

      const deviceData = await deviceRes.json();
      const auditData = await auditRes.json();
      const activityData = await activityRes.json();

      setDevices(deviceData);
      setAudit(auditData);
      setActivities(activityData.activities || []);

      setMessage("API Online");
    } catch (error) {
      console.error(error);
      setMessage("API Offline");
    }
  };
  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const time = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      setCurrentTime(time);
    };

    updateClock();

    const timer = setInterval(updateClock, 1000);

    return () => clearInterval(timer);
  }, []);

  const backupDevice = async (id, name) => {
    try {
      setMessage(`Backing up ${name}...`);

      const response = await fetch(`${API}/backup/${id}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Backup failed");
      }

      const result = await response.json();

      console.log("Backup result:", result);

      setMessage(`${name} backup completed`);
    } catch (error) {
      console.error(error);
      setMessage(`${name} backup failed`);
    }
  };

  const auditDevice = async (id, name) => {
    try {
      setMessage(`Auditing ${name}...`);

      const response = await fetch(`${API}/audit/${id}`);

      if (!response.ok) {
        throw new Error("Audit failed");
      }

      const result = await response.json();

      console.log("Audit result:", result);

      if (result.compliant) {
        setMessage(`${name} is 100% compliant`);
      } else {
        setMessage(
          `${name}: ${result.compliance_score}% compliant — Missing: ${result.missing_commands.join(", ")}`
        );
      }

      await loadDashboard();
    } catch (error) {
      console.error(error);
      setMessage(`${name} audit failed`);
    }
  };

  const fixConfiguration = async (id, name) => {
    try {
      setMessage(`Checking ${name}...`);

      // First audit the device
      const auditResponse = await fetch(`${API}/audit/${id}`);

      if (!auditResponse.ok) {
        throw new Error("Audit failed");
      }

      const auditResult = await auditResponse.json();

      // Already compliant
      if (auditResult.missing_commands.length === 0) {
        setMessage(`${name} is already 100% compliant`);
        return;
      }

      setMessage(`Fixing ${name}...`);

      // Deploy only the missing commands
      const deployResponse = await fetch(`${API}/deploy/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commands: auditResult.missing_commands,
        }),
      });

      if (!deployResponse.ok) {
        throw new Error("Deployment failed");
      }

      // Reload dashboard after deployment
      await loadDashboard();

      setMessage(`${name} configuration fixed successfully`);
    } catch (error) {
      console.error(error);
      setMessage(`${name} configuration fix failed`);
    }
  };

  const getDeviceAudit = (name) => {
    return audit?.devices?.find(
      (item) => item.device === name
    );
  };
  const backupAll = async () => {
    try {
      setMessage("Backing up all devices...");

      const response = await fetch(`${API}/backup-all`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Bulk backup failed");
      }

      const result = await response.json();

      setMessage(
        `Backup complete: ${result.successful_backups}/${result.total_devices} devices`
      );
    } catch (error) {
      console.error(error);
      setMessage("Bulk backup failed");
    }
  };


  const auditAll = async () => {
    try {
      setMessage("Auditing network...");

      const response = await fetch(`${API}/audit-all`);

      if (!response.ok) {
        throw new Error("Bulk audit failed");
      }

      const result = await response.json();

      setAudit(result);

      setMessage(
        `Network audit complete — ${result.average_compliance_score}% compliance`
      );
    } catch (error) {
      console.error(error);
      setMessage("Network audit failed");
    }
  };

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">N</div>

          <div>
            <h1>NexusOps</h1>
            <span>Network Automation</span>
          </div>
        </div>

        <nav>
          <div className="nav-section">Workspace</div>

          <button
            className={`nav-item ${activeSection === "dashboard" ? "active" : ""}`}
            onClick={() => {
              setActiveSection("dashboard");
              document.getElementById("dashboard")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={`nav-item ${activeSection === "devices" ? "active" : ""}`}
            onClick={() => {
              setActiveSection("devices");
              document.getElementById("devices")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          >
            <span>▣</span>
            Devices
            <span className="badge">{devices.length}</span>
          </button>

          <button
            className={`nav-item ${activeSection === "backups" ? "active" : ""}`}
            onClick={() => {
              setActiveSection("backups");
              document.getElementById("backups")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          >
            <span>↓</span>
            Backups
          </button>

          <button
            className={`nav-item ${activeSection === "compliance" ? "active" : ""}`}
            onClick={() => {
              setActiveSection("compliance");
              document.getElementById("compliance")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          >
            <span>✓</span>
            Compliance
          </button>

          <button
            className={`nav-item ${activeSection === "activity" ? "active" : ""}`}
            onClick={() => {
              setActiveSection("activity");
              document.getElementById("activity")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          >
            <span>↻</span>
            <span>Activity</span>
          </button>

          <div className="nav-section">System</div>

          <button className="nav-item">
            <span>⚙</span>
            Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="avatar">NA</div>

          <div>
            <strong>Network Admin</strong>
            <span>Administrator</span>
          </div>
        </div>
      </aside>


      {/* MAIN DASHBOARD */}
      <main className="main">

        {/* HEADER */}
        <header className="topbar">
          <div>
            <h2>Dashboard</h2>
            <p>Network infrastructure overview</p>
          </div>

          <div className="topbar-actions">
            <div className="search">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search devices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="clock">
              {currentTime}
            </div>

            <div
              className={`live-status ${message === "API Offline" ? "offline" : ""
                }`}
            >
              <span className="live-dot"></span>
              {message === "API Offline" ? "Offline" : "Live"}
            </div>
          </div>
        </header>


        <div className="content">

          {/* STATUS MESSAGE */}
          <div className="system-message">
            {message}
          </div>


          {/* STATISTICS */}
          <section id="dashboard" className="stats">

            <div className="stat-card">
              <div className="stat-top">
                <span>Total Devices</span>
                <span>▣</span>
              </div>

              <div className="stat-value">
                {(audit?.total_devices ?? devices.length)
                  .toString()
                  .padStart(2, "0")}

                <small> nodes</small>
              </div>

              <div className="stat-meta">
                Registered infrastructure
              </div>
            </div>


            <div className="stat-card">
              <div className="stat-top">
                <span>Online</span>
                <span>●</span>
              </div>

              <div className="stat-value">
                {devices
                  .filter((device) => device.status === "online")
                  .length
                  .toString()
                  .padStart(2, "0")}

                <small> active</small>
              </div>

              <div className="stat-meta">
                Devices currently reachable
              </div>
            </div>


            <div className="stat-card">
              <div className="stat-top">
                <span>Compliance</span>
                <span>✓</span>
              </div>

              <div className="stat-value">
                {audit?.average_compliance_score ?? 0}

                <small>%</small>
              </div>

              <div className="stat-meta">
                Network configuration health
              </div>
            </div>

          </section>


          {/* NETWORK TOPOLOGY */}
          <section id="devices" className="panel">

            <div className="panel-header">
              <div>
                <h3>Network Topology</h3>
                <p>Live infrastructure overview</p>
              </div>

              <button onClick={loadDashboard}>
                Refresh
              </button>
            </div>


            <div className="topology">
              <div className="topology-node core">
                <div className="node-circle">SW</div>
                <strong>core-sw01</strong>
                <span>Core Switch</span>
              </div>

              <div className="topology-links">
                <div className="trunk"></div>
                <div className="branch"></div>
                <div className="drop drop-left"></div>
                <div className="drop drop-right"></div>

                <span className="junction junction-center"></span>
                <span className="junction junction-left"></span>
                <span className="junction junction-right"></span>
              </div>

              <div className="topology-row">
                {devices.map((device) => (
                  <div
                    className={`topology-node router-node ${searchTerm &&
                      (
                        device.name?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
                        device.host?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
                        device.device_type?.toLowerCase().includes(searchTerm.toLowerCase().trim())
                      )
                      ? "search-match"
                      : searchTerm
                        ? "search-dim"
                        : ""
                      }`}
                    key={device.id}
                  >
                    <div
                      className={`node-circle ${device.status === "online"
                        ? "node-online"
                        : "node-offline"
                        }`}
                    >
                      RT
                    </div>

                    <strong>{device.name}</strong>
                    <span>{device.host}</span>
                  </div>
                ))}
              </div>
            </div>





          </section>


          {/* DEVICE FLEET */}
          <section className="panel">

            <div className="panel-header">
              <div>
                <h3>Device Fleet</h3>
                <p>
                  Manage registered network infrastructure
                </p>
              </div>

              <div className="fleet-actions">
                <button onClick={backupAll}>
                  Backup All
                </button>

                <button onClick={auditAll}>
                  Audit All
                </button>
              </div>
            </div>


            <div className="table-wrapper">

              <table className="device-table">

                <thead>
                  <tr>
                    <th>Device</th>
                    <th>IP Address</th>
                    <th>Platform</th>
                    <th>Status</th>
                    <th>Compliance</th>
                    <th>Actions</th>
                  </tr>
                </thead>


                <tbody>

                  {devices
                    .filter((device) => {
                      const search = searchTerm.toLowerCase().trim();

                      return (
                        device.name?.toLowerCase().includes(search) ||
                        device.host?.toLowerCase().includes(search) ||
                        device.device_type?.toLowerCase().includes(search)
                      );
                    })
                    .map((device) => {

                      const result =
                        getDeviceAudit(device.name);

                      return (
                        <tr key={device.id}>

                          <td>
                            <div className="device-name">
                              <div className="device-icon">
                                RT
                              </div>

                              <strong>
                                {device.name}
                              </strong>
                            </div>
                          </td>


                          <td className="mono">
                            {device.host}
                          </td>


                          <td>
                            {device.device_type}
                          </td>


                          <td>
                            <span
                              className={`status-pill ${device.status === "online"
                                ? "online"
                                : "offline"
                                }`}
                            >
                              ● {device.status}
                            </span>
                          </td>


                          <td>
                            <div className="compliance-cell">

                              <span>
                                {result?.compliance_score ?? 0}%
                              </span>

                              <div className="mini-progress">
                                <div
                                  style={{
                                    width: `${result?.compliance_score ?? 0
                                      }%`,
                                  }}
                                />
                              </div>

                            </div>
                          </td>


                          <td>
                            <div className="row-actions">

                              <button
                                onClick={() =>
                                  backupDevice(
                                    device.id,
                                    device.name
                                  )
                                }
                              >
                                Backup
                              </button>


                              <button
                                onClick={() =>
                                  auditDevice(
                                    device.id,
                                    device.name
                                  )
                                }
                              >
                                Audit
                              </button>


                              <button
                                onClick={() =>
                                  fixConfiguration(
                                    device.id,
                                    device.name
                                  )
                                }
                              >
                                Fix
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    })}

                </tbody>

              </table>

            </div>

          </section>

          {/* COMPLIANCE MANAGEMENT */}
          <section id="compliance" className="panel compliance-section">

            <div className="panel-header">
              <div>
                <h2>Compliance Management</h2>
                <p>Configuration baseline and device compliance status</p>
              </div>

              <button onClick={auditAll}>
                Run Full Audit
              </button>
            </div>

            <div className="compliance-grid">

              {devices.map((device) => {
                const result = getDeviceAudit(device.name);
                const score = result?.compliance_score ?? 0;



                return (
                  <div className="compliance-card" key={device.id}>

                    <div className="compliance-card-header">
                      <div>
                        <strong>{device.name}</strong>
                        <span>{device.host}</span>
                      </div>

                      <div
                        className={`compliance-score ${score === 100 ? "compliant" : "non-compliant"
                          }`}
                      >
                        {score}%
                      </div>
                    </div>

                    <div className="compliance-progress">
                      <div
                        style={{
                          width: `${score}%`,
                        }}
                      />
                    </div>

                    <div className="compliance-details">
                      <span>
                        {result?.missing_commands?.length ?? 0} issue(s)
                      </span>

                      <strong>
                        {score === 100 ? "COMPLIANT" : "ACTION REQUIRED"}
                      </strong>
                    </div>

                    <div className="compliance-actions">
                      <button
                        onClick={() =>
                          auditDevice(device.id, device.name)
                        }
                      >
                        Audit
                      </button>

                      <button
                        onClick={() =>
                          fixConfiguration(device.id, device.name)
                        }
                      >
                        Fix Configuration
                      </button>
                    </div>

                  </div>
                );
              })}

            </div>

          </section>


          {/* BACKUP MANAGEMENT */}
          <section id="backups" className="panel backup-section">

            <div className="panel-header">
              <div>
                <h2>Backup Management</h2>
                <p>Manage network device configuration backups</p>
              </div>

              <button onClick={backupAll}>
                Backup All
              </button>
            </div>

            <div className="backup-grid">

              {devices.map((device) => (
                <div className="backup-card" key={device.id}>

                  <div className="backup-device">
                    <div className="backup-icon">
                      RT
                    </div>

                    <div>
                      <strong>{device.name}</strong>
                      <span>{device.host}</span>
                    </div>
                  </div>

                  <div className="backup-status">
                    <span>Configuration Backup</span>
                    <strong>Ready</strong>
                  </div>

                  <button
                    onClick={() =>
                      backupDevice(device.id, device.name)
                    }
                  >
                    Backup Now
                  </button>

                </div>
              ))}

            </div>

          </section>


          {/* RECENT ACTIVITY */}
          <section id="activity" className="panel activity-section">

            <div className="panel-header">
              <div>
                <h3>Recent Activity</h3>
                <p>
                  Latest network automation operations
                </p>
              </div>
            </div>


            <div className="activity-list">

              {activities.length === 0 ? (

                <div className="empty-state">
                  No activity recorded yet.
                </div>

              ) : (

                activities
                  .slice(0, 8)
                  .map((activity, index) => (

                    <div
                      className="activity-row"
                      key={index}
                    >
                      <span className="activity-dot">
                        ●
                      </span>

                      <span>{activity}</span>
                    </div>

                  ))

              )}

            </div>

          </section>

        </div>
      </main>
    </div >
  );
}

export default App;