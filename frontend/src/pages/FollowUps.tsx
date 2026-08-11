import { useEffect, useState } from "react";
import { Plus, RefreshCw, X, Calendar, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import api, { apiMessage } from "../services/api";

interface Customer { id: string; name: string; mobile: string; }
interface Employee { id: string; name: string; email: string; }

interface FollowUp {
  id: string;
  title: string;
  notes?: string | null;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  followUpDate: string;
  assignedTo?: string | null;
  customerId: string;
  customer?: { id: string; name: string; mobile: string };
  assignedToUser?: { id: string; name: string; email: string } | null;
  createdByUser?: { id: string; name: string; email: string };
}

interface Stats { today: FollowUp[]; overdue: FollowUp[]; upcoming: FollowUp[]; }

const emptyForm = { customerId: "", title: "", notes: "", followUpDate: "", assignedTo: "" };

export default function FollowUps() {
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [stats, setStats] = useState<Stats>({ today: [], overdue: [], upcoming: [] });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState<"" | "PENDING" | "COMPLETED" | "CANCELLED">("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const params: any = { page, limit };
      if (filter) params.status = filter;
      const [listRes, statsRes] = await Promise.all([
        api.get("/followups", { params }),
        api.get("/followups/dashboard/summary"),
      ]);
      setFollowups(listRes.data.data.followUps || []);
      setTotal(listRes.data.data.pagination?.total || 0);
      setStats(statsRes.data.data || { today: [], overdue: [], upcoming: [] });
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await api.get("/customers", { params: { limit: 200 } });
      setCustomers(res.data.data.customers || []);
    } catch (_) {}
  };

  const loadEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data.data || []);
    } catch (_) {}
  };

  useEffect(() => { load(); }, [page, filter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    loadCustomers();
    loadEmployees();
    setShowModal(true);
  };

  const openEdit = (f: FollowUp) => {
    setEditingId(f.id);
    setForm({
      customerId: f.customerId,
      title: f.title,
      notes: f.notes || "",
      followUpDate: f.followUpDate ? f.followUpDate.slice(0, 16) : "",
      assignedTo: f.assignedTo || "",
    });
    setFormError("");
    loadCustomers();
    loadEmployees();
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.title || !form.followUpDate) {
      setFormError("Customer, title and follow-up date are required.");
      return;
    }
    try {
      setSaving(true);
      setFormError("");
      const payload = {
        customerId: form.customerId,
        title: form.title.trim(),
        notes: form.notes.trim() || undefined,
        followUpDate: new Date(form.followUpDate).toISOString(),
        assignedTo: form.assignedTo || undefined,
      };
      if (editingId) {
        await api.put(`/followups/${editingId}`, payload);
        setSuccess("Follow-up updated.");
      } else {
        await api.post("/followups", payload);
        setSuccess("Follow-up created.");
      }
      setShowModal(false);
      load();
    } catch (err) {
      setFormError(apiMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await api.put(`/followups/${id}`, { status: "COMPLETED" });
      setSuccess("Marked as completed.");
      load();
    } catch (err) { setError(apiMessage(err)); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this follow-up?")) return;
    try {
      await api.delete(`/followups/${id}`);
      setSuccess("Follow-up deleted.");
      load();
    } catch (err) { setError(apiMessage(err)); }
  };

  const totalPages = Math.ceil(total / limit);
  const todayCount = stats.today?.length ?? 0;
  const overdueCount = stats.overdue?.length ?? 0;
  const upcomingCount = stats.upcoming?.length ?? 0;

  return (
    <div className="customers-page">
      {/* Header */}
      <div className="page-heading">
        <div>
          <h1>Customer Follow-ups</h1>
          <p>Track and manage customer follow-ups</p>
        </div>
        <button className="primary-button" onClick={openCreate}>
          <Plus size={16} /> New Follow-up
        </button>
      </div>

      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 24 }}>
        <StatCard icon={<Calendar size={20} />} label="Today" value={todayCount} color="#2563eb" bg="#eff6ff" />
        <StatCard icon={<AlertTriangle size={20} />} label="Overdue" value={overdueCount} color="#dc2626" bg="#fef2f2" />
        <StatCard icon={<Clock size={20} />} label="Upcoming (7d)" value={upcomingCount} color="#d97706" bg="#fffbeb" />
      </div>

      {/* Filter tabs + table */}
      <div className="customer-card">
        <div className="customer-card-header">
          <div>
            <h2>Follow-ups</h2>
            <p>{total} total</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {(["", "PENDING", "COMPLETED", "CANCELLED"] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setFilter(s); setPage(1); }}
                style={{
                  padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: filter === s ? "none" : "1px solid #e5e7eb",
                  background: filter === s ? "#2563eb" : "transparent",
                  color: filter === s ? "white" : "#6b7280",
                }}
              >
                {s === "" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
            <button className="refresh-button" onClick={load} disabled={loading}>
              <RefreshCw size={14} className={loading ? "spin" : ""} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="customer-empty"><RefreshCw size={24} className="spin" /><h3>Loading...</h3></div>
        ) : followups.length === 0 ? (
          <div className="customer-empty">
            <Calendar size={40} />
            <h3>No follow-ups found</h3>
            <p>Create your first follow-up to get started.</p>
            <button className="primary-button" onClick={openCreate}><Plus size={15} /> New Follow-up</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Customer</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {followups.map((f) => {
                  const isOverdue = f.status === "PENDING" && new Date(f.followUpDate) < new Date();
                  return (
                    <tr key={f.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{f.title}</div>
                        {f.notes && <div style={{ color: "#9ca3af", fontSize: 11, marginTop: 2 }}>{f.notes.slice(0, 60)}{f.notes.length > 60 ? "…" : ""}</div>}
                      </td>
                      <td style={{ fontWeight: 500 }}>{f.customer?.name || "—"}</td>
                      <td style={{ color: isOverdue ? "#dc2626" : "#374151", fontWeight: isOverdue ? 700 : 400 }}>
                        {new Date(f.followUpDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        {isOverdue && <span style={{ display: "block", fontSize: 10, color: "#dc2626" }}>OVERDUE</span>}
                      </td>
                      <td>
                        <StatusBadge status={f.status} />
                      </td>
                      <td style={{ color: "#6b7280", fontSize: 12 }}>{f.assignedToUser?.name || "Unassigned"}</td>
                      <td style={{ textAlign: "right" }}>
                        <div className="action-buttons" style={{ justifyContent: "flex-end" }}>
                          {f.status === "PENDING" && (
                            <button className="edit-button" title="Mark complete" onClick={() => handleComplete(f.id)}>
                              <CheckCircle size={15} />
                            </button>
                          )}
                          <button className="edit-button" title="Edit" onClick={() => openEdit(f)}>
                            ✏️
                          </button>
                          <button className="delete-button" title="Delete" onClick={() => handleDelete(f.id)}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderTop: "1px solid #e5e7eb" }}>
            <button className="secondary-button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
            <span style={{ fontSize: 13, color: "#6b7280" }}>Page {page} of {totalPages}</span>
            <button className="secondary-button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="customer-modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div>
                <h2>{editingId ? "Edit Follow-up" : "New Follow-up"}</h2>
                <p>{editingId ? "Update follow-up details." : "Schedule a customer follow-up."}</p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)} disabled={saving}><X size={18} /></button>
            </div>

            {formError && <div className="modal-error">{formError}</div>}

            <form onSubmit={handleSubmit} className="customer-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Customer *</label>
                  <select value={form.customerId} onChange={e => setForm(p => ({ ...p, customerId: e.target.value }))} required>
                    <option value="">Select customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.mobile}</option>)}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Title *</label>
                  <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Follow up on quotation" required />
                </div>

                <div className="form-group">
                  <label>Follow-up Date & Time *</label>
                  <input type="datetime-local" value={form.followUpDate} onChange={e => setForm(p => ({ ...p, followUpDate: e.target.value }))} required />
                </div>

                <div className="form-group">
                  <label>Assign To</label>
                  <select value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))}>
                    <option value="">Unassigned</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Additional notes..." rows={3} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? <><RefreshCw size={14} className="spin" /> Saving...</> : editingId ? "Update" : "Create Follow-up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: number; color: string; bg: string }) {
  return (
    <div className="stat-card" style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px" }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#111827" }}>{value}</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    PENDING: { bg: "#fef3c7", color: "#d97706" },
    COMPLETED: { bg: "#dcfce7", color: "#16a34a" },
    CANCELLED: { bg: "#fee2e2", color: "#dc2626" },
  };
  const s = map[status] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}
