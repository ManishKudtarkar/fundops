import {
  Users,
  Package,
  Boxes,
  FileText,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";

const stats = [
  {
    title: "Total Customers",
    value: "1",
    description: "Active CRM customers",
    icon: Users,
  },
  {
    title: "Total Products",
    value: "2",
    description: "Products in catalog",
    icon: Package,
  },
  {
    title: "Inventory Items",
    value: "2",
    description: "Tracked inventory items",
    icon: Boxes,
  },
  {
    title: "Sales Challans",
    value: "2",
    description: "Confirmed challans",
    icon: FileText,
  },
];

function Dashboard() {
  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>
            Welcome back. Here's what's happening with your operations.
          </p>
        </div>

        <button className="primary-button">
          + New Challan
        </button>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="stat-card" key={stat.title}>
              <div className="stat-top">
                <div className="stat-icon">
                  <Icon size={21} />
                </div>

                <ArrowUpRight size={17} />
              </div>

              <h2>{stat.value}</h2>
              <h3>{stat.title}</h3>
              <p>{stat.description}</p>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid">
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
                <tr>
                  <td>CH-20260810-59A53779</td>
                  <td>Rajesh Patel</td>
                  <td>4</td>
                  <td>
                    <span className="badge confirmed">
                      CONFIRMED
                    </span>
                  </td>
                </tr>

                <tr>
                  <td>CH-20260810-F8731980</td>
                  <td>Rajesh Patel</td>
                  <td>2</td>
                  <td>
                    <span className="badge confirmed">
                      CONFIRMED
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Low Stock Alert</h2>
              <p>Products requiring attention</p>
            </div>

            <AlertTriangle size={20} />
          </div>

          <div className="alert-product">
            <div>
              <strong>USB Cable</strong>
              <span>SKU: USB-001</span>
            </div>

            <div className="stock-warning">
              <strong>1</strong>
              <span>/ 10</span>
            </div>
          </div>

          <div className="stock-bar">
            <div style={{ width: "10%" }}></div>
          </div>

          <p className="warning-text">
            Stock is below the minimum level.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;