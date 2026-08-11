import { useEffect, useState } from "react";
import api from "../services/api";

interface PlatformStats {
  totalBusinesses: number;
  activeBusinesses: number;
  totalUsers: number;
  totalCustomers: number;
}

export default function PlatformDashboard() {
  const [stats, setStats] = useState<PlatformStats>({
    totalBusinesses: 0,
    activeBusinesses: 0,
    totalUsers: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get("/dashboard");
        if (response.data.data) {
          setStats(response.data.data);
        }
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Platform Administration</h1>
        <p>Manage all businesses and platform metrics</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading dashboard...</div>
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Total Businesses</h3>
            </div>
            <div className="card-content">
              <div className="stat-number">{stats.totalBusinesses}</div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h3>Active Businesses</h3>
            </div>
            <div className="card-content">
              <div className="stat-number">{stats.activeBusinesses}</div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h3>Total Users</h3>
            </div>
            <div className="card-content">
              <div className="stat-number">{stats.totalUsers}</div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h3>Total Customers</h3>
            </div>
            <div className="card-content">
              <div className="stat-number">{stats.totalCustomers}</div>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-actions">
        <a href="/businesses" className="btn btn-primary">
          Manage Businesses
        </a>
      </div>
    </div>
  );
}
