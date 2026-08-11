import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Package, Boxes, FileText, TrendingUp, AlertTriangle } from "lucide-react";
import api, { apiMessage } from "../services/api";
import { isSuperAdmin } from "../services/auth.service";

interface BusinessMetrics {
  totalCustomers: number;
  totalProducts: number;
  totalInventoryUnits: number;
  unitsMovedThisMonth: number;
  confirmedChallans: number;
  totalChallans: number;
  lowStockCount: number;
  newCustomerGrowth: number;
  operationalHealth: number;
  trend: number[];
}

interface PlatformMetrics {
  totalBusinesses: number;
  activeBusinesses: number;
  suspendedBusinesses: number;
  totalUsers: number;
  totalChallans: number;
  totalProducts: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const superAdmin = isSuperAdmin();
  const [data, setData] = useState<BusinessMetrics | PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/dashboard")
      .then((res) => setData(res.data.data))
      .catch((err) => setError(apiMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page" style={{ padding: 40, color: "#6b7280" }}>Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="page" style={{ padding: 40 }}>
        <div style={{ color: "#991b1b", background: "#fee2e2", padding: "12px 16px", borderRadius: 8 }}>{error}</div>
      </div>
    );
  }

  if (superAdmin) {
    const m = data as PlatformMetrics;
    return (
      <div className="page">
        <div className="page-header" style={{ marginBottom: 28 }}>
          <h1>Platform Dashboard</h1>
          <p>Overview of all businesses on the platform</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
          <StatCard icon={<Users size={22} />} label="Total Businesses" value={m?.totalBusinesses ?? 0} color="#6366f1" />
          <StatCard icon={<Users size={22} />} label="Active Businesses" value={m?.activeBusinesses ?? 0} color="#22c55e" />
          <StatCard icon={<AlertTriangle size={22} />} label="Suspended" value={m?.suspendedBusinesses ?? 0} color="#f59e0b" />
          <StatCard icon={<Users size={22} />} label="Total Users" value={m?.totalUsers ?? 0} color="#3b82f6" />
          <StatCard icon={<FileText size={22} />} label="Total Challans" value={m?.totalChallans ?? 0} color="#8b5cf6" />
          <StatCard icon={<Package size={22} />} label="Total Products" value={m?.totalProducts ?? 0} color="#ec4899" />
        </div>
        <button className="primary-button" onClick={() => navigate("/businesses")}>
          Manage Businesses
        </button>
      </div>
    );
  }

  const m = data as BusinessMetrics;
  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: 28 }}>
        <h1>Dashboard</h1>
        <p>Your business at a glance</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard icon={<Users size={22} />} label="Customers" value={m?.totalCustomers ?? 0} color="#6366f1"
          sub={m?.newCustomerGrowth ? `${m.newCustomerGrowth > 0 ? "+" : ""}${m.newCustomerGrowth}% this month` : undefined} />
        <StatCard icon={<Package size={22} />} label="Products" value={m?.totalProducts ?? 0} color="#3b82f6" />
        <StatCard icon={<Boxes size={22} />} label="Inventory Units" value={m?.totalInventoryUnits ?? 0} color="#22c55e"
          sub={m?.lowStockCount ? `${m.lowStockCount} low stock` : undefined} subColor="#f59e0b" />
        <StatCard icon={<TrendingUp size={22} />} label="Units Moved (30d)" value={m?.unitsMovedThisMonth ?? 0} color="#8b5cf6" />
        <StatCard icon={<FileText size={22} />} label="Challans" value={m?.totalChallans ?? 0} color="#ec4899"
          sub={`${m?.confirmedChallans ?? 0} confirmed`} />
        <StatCard icon={<TrendingUp size={22} />} label="Health Score" value={`${m?.operationalHealth ?? 0}/5`} color="#f59e0b" />
      </div>

      {m?.lowStockCount > 0 && (
        <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={18} color="#d97706" />
          <span style={{ color: "#92400e", fontSize: 14 }}>
            <strong>{m.lowStockCount}</strong> product{m.lowStockCount !== 1 ? "s are" : " is"} at or below minimum stock level.
          </span>
          <button className="secondary-button" style={{ marginLeft: "auto", fontSize: 13 }} onClick={() => navigate("/products")}>
            View Products
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <QuickAction label="Add Customer" onClick={() => navigate("/customers")} />
        <QuickAction label="New Challan" onClick={() => navigate("/challans")} />
        <QuickAction label="Stock Movement" onClick={() => navigate("/inventory")} />
        <QuickAction label="View Products" onClick={() => navigate("/products")} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, sub, subColor }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  sub?: string;
  subColor?: string;
}) {
  return (
    <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e7eb", padding: "20px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ background: `${color}18`, borderRadius: 8, padding: 8, color }}>{icon}</div>
        <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: subColor ?? "#6b7280", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function QuickAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: "white", border: "1px solid #e5e7eb", borderRadius: 10,
      padding: "16px 20px", textAlign: "left", cursor: "pointer", fontSize: 14,
      fontWeight: 600, color: "#374151", transition: "border-color 0.15s",
    }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
    >
      {label} →
    </button>
  );
}
