import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import api, { apiMessage } from "../services/api";
import { isSuperAdmin } from "../services/auth.service";

interface AuditLog {
  id: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, any> | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string; role: string } | null;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterAction, setFilterAction] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const limit = 50;
  const superAdmin = isSuperAdmin();

  const load = async (pageNum = page) => {
    try {
      setLoading(true);
      setError("");
      const endpoint = superAdmin ? "/audit/platform" : "/audit/business";
      const params: any = { page: pageNum, limit };
      if (filterAction.trim()) params.action = filterAction.trim().toUpperCase();
      if (startDate) params.dateFrom = startDate;
      if (endDate) params.dateTo = endDate;
      const res = await api.get(endpoint, { params });
      setLogs(res.data.data.logs || []);
      setTotal(res.data.data.pagination?.total || 0);
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page, filterAction, startDate, endDate]);

  const clearFilters = () => {
    setFilterAction("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="customers-page">
      <div className="page-heading">
        <div>
          <h1>Audit Logs</h1>
          <p>{superAdmin ? "Platform-wide activity log" : "Business activity log"}</p>
        </div>
        <button className="refresh-button" onClick={() => load(page)} disabled={loading}>
          <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters */}
      <div className="customers-toolbar" style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Filter by action (e.g. LOGIN, CREATE_CUSTOMER)..."
          value={filterAction}
          onChange={e => { setFilterAction(e.target.value); setPage(1); }}
          style={{ flex: 1, height: 42, border: "1px solid #d1d5db", borderRadius: 8, padding: "0 12px", fontSize: 13 }}
        />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }}
            style={{ height: 42, border: "1px solid #d1d5db", borderRadius: 8, padding: "0 10px", fontSize: 13 }} />
          <span style={{ color: "#9ca3af", fontSize: 13 }}>to</span>
          <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }}
            style={{ height: 42, border: "1px solid #d1d5db", borderRadius: 8, padding: "0 10px", fontSize: 13 }} />
          {(filterAction || startDate || endDate) && (
            <button className="secondary-button" onClick={clearFilters} style={{ height: 42, padding: "0 14px" }}>
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="customer-card">
        <div className="customer-card-header">
          <div>
            <h2>Activity Log</h2>
            <p>{total} entries</p>
          </div>
        </div>

        {loading ? (
          <div className="customer-empty"><RefreshCw size={24} className="spin" /><h3>Loading logs...</h3></div>
        ) : logs.length === 0 ? (
          <div className="customer-empty">
            <h3>No audit logs found</h3>
            <p>{filterAction || startDate || endDate ? "Try adjusting your filters." : "No activity recorded yet."}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>IP Address</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: "nowrap", color: "#6b7280", fontSize: 12 }}>
                      {new Date(log.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{log.user?.name || "System"}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{log.user?.email || ""}</div>
                    </td>
                    <td>
                      <ActionBadge action={log.action} />
                    </td>
                    <td style={{ fontSize: 12, color: "#374151" }}>
                      {log.entityType && <div style={{ fontWeight: 600 }}>{log.entityType}</div>}
                      {log.entityId && <div style={{ color: "#9ca3af", fontSize: 11, fontFamily: "monospace" }}>{log.entityId.slice(0, 12)}…</div>}
                    </td>
                    <td style={{ fontSize: 12, color: "#9ca3af", fontFamily: "monospace" }}>{log.ipAddress || "—"}</td>
                    <td>
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <details>
                          <summary style={{ cursor: "pointer", fontSize: 12, color: "#2563eb", fontWeight: 600 }}>View</summary>
                          <pre style={{ marginTop: 6, fontSize: 11, background: "#f8fafc", padding: 8, borderRadius: 6, maxWidth: 280, overflow: "auto", color: "#374151" }}>
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      ) : <span style={{ color: "#d1d5db" }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderTop: "1px solid #e5e7eb" }}>
            <button className="secondary-button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
            <span style={{ fontSize: 13, color: "#6b7280" }}>Page {page} of {totalPages} · {total} total</span>
            <button className="secondary-button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const color = action.startsWith("CREATE") ? { bg: "#dcfce7", color: "#16a34a" }
    : action.startsWith("UPDATE") ? { bg: "#dbeafe", color: "#1d4ed8" }
    : action.startsWith("DELETE") || action.startsWith("CANCEL") ? { bg: "#fee2e2", color: "#dc2626" }
    : action === "LOGIN" ? { bg: "#f3f4f6", color: "#374151" }
    : action.includes("STOCK") ? { bg: "#fef3c7", color: "#d97706" }
    : { bg: "#f3f4f6", color: "#374151" };

  return (
    <span style={{ padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: color.bg, color: color.color, whiteSpace: "nowrap" }}>
      {action.replace(/_/g, " ")}
    </span>
  );
}
