import { useEffect, useState } from "react";
import {
  Users,
  Package,
  Boxes,
  FileText,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";

import api, { apiMessage } from "../services/api";

interface Customer {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minimumStock: number;
}

interface Challan {
  id: string;
  challanNumber: string;
  totalQuantity: number;
  status: string;
  customer?: {
    name: string;
  };
}

function Dashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [challans, setChallans] = useState<Challan[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [
        customersResponse,
        productsResponse,
        challansResponse,
      ] = await Promise.all([
        api.get("/customers"),
        api.get("/products"),
        api.get("/challans"),
      ]);

      setCustomers(
        customersResponse.data?.data?.customers ?? []
      );

      setProducts(
        productsResponse.data?.data?.products ?? []
      );

      setChallans(
        challansResponse.data?.data?.challans ?? []
      );
    } catch (error) {
      console.error("Dashboard loading error:", error);

      setError(apiMessage(error));
    } finally {
      setLoading(false);
    }
  }

  const lowStockProducts = products.filter(
    (product) =>
      Number(product.currentStock) <=
      Number(product.minimumStock)
  );

  const confirmedChallans = challans.filter(
    (challan) => challan.status === "CONFIRMED"
  );

  const recentChallans = [...challans]
    .sort(
      (a, b) =>
        String(b.id).localeCompare(String(a.id))
    )
    .slice(0, 5);

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>

          <p>
            Welcome back. Here's what's happening with
            your operations.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            (window.location.href = "/challans")
          }
        >
          + New Challan
        </button>
      </div>

      {error && (
        <div className="error-alert">
          {error}
        </div>
      )}

      {/* STATS */}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon">
              <Users size={22} />
            </div>

            <ArrowUpRight size={18} />
          </div>

          <h2>
            {loading ? "..." : customers.length}
          </h2>

          <h3>Total Customers</h3>

          <p>Active CRM customers</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon">
              <Package size={22} />
            </div>

            <ArrowUpRight size={18} />
          </div>

          <h2>
            {loading ? "..." : products.length}
          </h2>

          <h3>Total Products</h3>

          <p>Products in catalog</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon">
              <Boxes size={22} />
            </div>

            <ArrowUpRight size={18} />
          </div>

          <h2>
            {loading ? "..." : products.length}
          </h2>

          <h3>Inventory Items</h3>

          <p>Tracked inventory items</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon">
              <FileText size={22} />
            </div>

            <ArrowUpRight size={18} />
          </div>

          <h2>
            {loading ? "..." : confirmedChallans.length}
          </h2>

          <h3>Sales Challans</h3>

          <p>Confirmed challans</p>
        </div>
      </div>

      {/* LOWER SECTION */}

      <div className="dashboard-grid">
        {/* RECENT CHALLANS */}

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Recent Sales Challans</h2>

              <p>Latest customer orders</p>
            </div>

            <a href="/challans">View all</a>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Challan</th>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4}>
                      Loading...
                    </td>
                  </tr>
                ) : recentChallans.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      No sales challans found.
                    </td>
                  </tr>
                ) : (
                  recentChallans.map((challan) => (
                    <tr key={challan.id}>
                      <td>
                        {challan.challanNumber}
                      </td>

                      <td>
                        {challan.customer?.name ??
                          "Unknown"}
                      </td>

                      <td>
                        {challan.totalQuantity}
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            challan.status.toLowerCase()
                          }`}
                        >
                          {challan.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* LOW STOCK */}

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Low Stock Alert</h2>

              <p>Products requiring attention</p>
            </div>

            <AlertTriangle size={22} />
          </div>

          {loading ? (
            <div className="warning-text">
              Loading inventory...
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="warning-text">
              No products are below their minimum
              stock level.
            </div>
          ) : (
            lowStockProducts.map((product) => {
              const current = Number(
                product.currentStock
              );

              const minimum = Number(
                product.minimumStock
              );

              const percentage =
                minimum > 0
                  ? Math.min(
                      (current / minimum) * 100,
                      100
                    )
                  : 0;

              return (
                <div key={product.id}>
                  <div className="alert-product">
                    <div>
                      <strong>
                        {product.name}
                      </strong>

                      <span>
                        SKU: {product.sku}
                      </span>
                    </div>

                    <div className="stock-warning">
                      <strong>{current}</strong>

                      <span>
                        / {minimum}
                      </span>
                    </div>
                  </div>

                  <div className="stock-bar">
                    <div
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <p className="warning-text">
                    Stock is below the minimum level.
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;